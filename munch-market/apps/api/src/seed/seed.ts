import 'reflect-metadata';
import { hash } from 'bcryptjs';
import { DataSource } from 'typeorm';
import { databaseOptions } from '../database';
import { FulfilmentTask, FulfilmentTaskStatus } from '../fulfilment/fulfilment-task.entity';
import { estimateDelivery } from '../orders/delivery';
import { OrderLine } from '../orders/order-line.entity';
import { Carrier, Order, OrderStatus, ShippingAddress } from '../orders/order.entity';
import { Category } from '../products/category.entity';
import { Product } from '../products/product.entity';
import { StockBatch } from '../products/stock-batch.entity';
import { User, UserRole } from '../users/user.entity';
import catalogue from './products.json';

const PASSWORD = 'munch123';

const USERS: { email: string; name: string; role: UserRole }[] = [
  { email: 'anna@example.com', name: 'Anna Kovács', role: 'customer' },
  { email: 'bence@example.com', name: 'Bence Nagy', role: 'customer' },
  { email: 'raktar@example.com', name: 'Réka Szabó', role: 'staff' },
  { email: 'admin@example.com', name: 'Márton Admin', role: 'admin' },
];

const CATEGORY_COPY: Record<string, string> = {
  snacks: 'Savoury snack, stored at room temperature.',
  pantry: 'Store-cupboard staple. Keep in a cool, dry place.',
  drinks: 'Shelf-stable drink. Best served chilled.',
  breakfast: 'Breakfast favourite. Reseal after opening.',
  sweets: 'Sweet treat. Keep away from heat and direct sunlight.',
  'baby-kids': 'For babies and children. Check the age guidance on the pack.',
};

/** Days of shelf life left on the near-expiry batch, per category. */
const NEAR_EXPIRY_DAYS: Record<string, number[]> = {
  snacks: [10, 4, 12, 9],
  pantry: [9, 14, 6, 11],
  drinks: [15, 5, 11, 8],
  breakfast: [7, 15, 3, 12],
  sweets: [13, 6, 15, 12],
  'baby-kids': [12, 5, 15, 8],
};
const EXTRA_NEAR_EXPIRY: Record<string, number> = { 'SWT-008': 14 };
const SOLD_OUT = new Set(['SNK-016', 'DRK-018', 'BBY-014']);

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(20261108);
const between = (min: number, max: number) =>
  min + Math.floor(random() * (max - min + 1));

function daysFromToday(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function batchCode() {
  return `L${between(1000, 9999)}${'ABCDEF'[between(0, 5)]}`;
}

function roundTo(quantity: number, increment: number) {
  return Math.max(increment, Math.round(quantity / increment) * increment);
}

async function seed() {
  const dataSource = new DataSource(databaseOptions);
  await dataSource.initialize();

  await dataSource.query(
    'TRUNCATE "fulfilment_task", "order_line", "order", "stock_batch", "product", "category", "user" RESTART IDENTITY CASCADE',
  );

  const passwordHash = await hash(PASSWORD, 10);
  const users = await dataSource
    .getRepository(User)
    .save(USERS.map((user) => ({ ...user, passwordHash })));
  const userByEmail = new Map(users.map((user) => [user.email, user]));

  const categories = await dataSource
    .getRepository(Category)
    .save(catalogue.categories);
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  const productRepo = dataSource.getRepository(Product);
  const batchRepo = dataSource.getRepository(StockBatch);
  const indexInCategory = new Map<string, number>();
  const products = new Map<string, Product>();
  let batchCount = 0;

  for (const item of catalogue.products) {
    const position = indexInCategory.get(item.category) ?? 0;
    indexInCategory.set(item.category, position + 1);
    const increment = item.orderIncrement ?? 1;

    const batches: { batchCode: string; bestBefore: string; quantity: number }[] = [];
    if (!SOLD_OUT.has(item.sku)) {
      const nearDays =
        position % 5 === 1
          ? NEAR_EXPIRY_DAYS[item.category][Math.floor(position / 5)]
          : EXTRA_NEAR_EXPIRY[item.sku];
      if (nearDays !== undefined) {
        batches.push({
          batchCode: batchCode(),
          bestBefore: daysFromToday(nearDays),
          quantity: roundTo(between(6, 30), increment),
        });
      }
      const others = between(1, nearDays === undefined ? 3 : 2);
      for (let i = 0; i < others; i++) {
        const far = random() < 0.4;
        batches.push({
          batchCode: batchCode(),
          bestBefore: daysFromToday(far ? between(90, 300) : between(20, 60)),
          quantity: roundTo(far ? between(24, 150) : between(12, 80), increment),
        });
      }
    }

    const product = await productRepo.save(
      productRepo.create({
        sku: item.sku,
        name: item.name,
        brand: item.brand,
        categoryId: categoryBySlug.get(item.category)!.id,
        imageUrl: `/images/${item.category}.svg`,
        description: item.description ?? `${item.brand} ${item.name}, ${item.unit}. ${CATEGORY_COPY[item.category]}`,
        listPrice: item.price,
        unitLabel: item.unit,
        minimumOrderableUnit: item.minimumOrderableUnit ?? 1,
        orderIncrement: increment,
        isAgeRestricted: item.isAgeRestricted ?? false,
        stock: batches.reduce((sum, batch) => sum + batch.quantity, 0),
        active: true,
      }),
    );
    await batchRepo.save(
      batches.map((batch) => batchRepo.create({ ...batch, productId: product.id })),
    );
    batchCount += batches.length;
    products.set(product.sku, product);
  }

  const addresses: Record<string, ShippingAddress> = {
    'anna@example.com': {
      name: 'Anna Kovács',
      phone: '+36 30 123 4567',
      zip: '1052',
      city: 'Budapest',
      street: 'Váci utca 12. 3/7',
    },
    'bence@example.com': {
      name: 'Bence Nagy',
      phone: '+36 20 987 6543',
      zip: '6720',
      city: 'Szeged',
      street: 'Kárász utca 5.',
    },
  };

  const history: {
    email: string;
    daysAgo: number;
    status: OrderStatus;
    carrier: Carrier;
    lines: [string, number][];
    task?: FulfilmentTaskStatus;
  }[] = [
    { email: 'anna@example.com', daysAgo: 21, status: 'shipped', carrier: 'gls', lines: [['BRK-011', 2], ['SWT-005', 3]], task: 'shipped' },
    { email: 'anna@example.com', daysAgo: 10, status: 'cancelled', carrier: 'posta', lines: [['PAN-018', 1]] },
    { email: 'anna@example.com', daysAgo: 3, status: 'pending_payment', carrier: 'gls', lines: [['SNK-005', 2], ['DRK-004', 1]] },
    { email: 'anna@example.com', daysAgo: 1, status: 'paid', carrier: 'posta', lines: [['BRK-009', 1], ['PAN-006', 2], ['DRK-001', 6]], task: 'open' },
    { email: 'bence@example.com', daysAgo: 7, status: 'shipped', carrier: 'posta', lines: [['SWT-001', 12]], task: 'shipped' },
    { email: 'bence@example.com', daysAgo: 1, status: 'picking', carrier: 'gls', lines: [['PAN-001', 3], ['PAN-012', 2], ['SNK-012', 1]], task: 'picked' },
    { email: 'bence@example.com', daysAgo: 0, status: 'paid', carrier: 'gls', lines: [['BBY-001', 4], ['BBY-007', 2]], task: 'open' },
  ];

  for (const [index, entry] of history.entries()) {
    const createdAt = new Date(Date.now() - entry.daysAgo * 86_400_000);
    const lines = entry.lines.map(([sku, quantity]) => {
      const product = products.get(sku)!;
      return { productId: product.id, quantity, unitPrice: product.listPrice };
    });
    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const shippingFee = entry.carrier === 'gls' ? 1990 : 990;
    const order = await dataSource.getRepository(Order).save({
      customerId: userByEmail.get(entry.email)!.id,
      status: entry.status,
      carrier: entry.carrier,
      shippingAddress: addresses[entry.email],
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      estimatedDelivery: estimateDelivery(entry.carrier, createdAt),
      paymentIntentId: `pi_seed_${String(index + 1).padStart(4, '0')}`,
      createdAt,
      updatedAt: createdAt,
    });
    await dataSource
      .getRepository(OrderLine)
      .save(lines.map((line) => ({ ...line, orderId: order.id })));
    if (entry.task) {
      await dataSource
        .getRepository(FulfilmentTask)
        .save({ orderId: order.id, status: entry.task, createdAt });
    }
  }

  console.log(
    `Seeded ${users.length} users, ${categories.length} categories, ${products.size} products, ${batchCount} batches, ${history.length} orders.`,
  );
  console.log(`All users have the password "${PASSWORD}".`);
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
