import { BadRequestException } from '@nestjs/common';

export interface StockCsvRow {
  line: number;
  sku: string;
  batchCode: string;
  bestBefore: string;
  quantity: number;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parses `sku,batchCode,bestBefore,quantity` rows. A header row is optional. */
export function parseStockCsv(csv: string): StockCsvRow[] {
  const rows: StockCsvRow[] = [];
  const lines = csv.split(/\r?\n/);

  lines.forEach((raw, index) => {
    const text = raw.trim();
    if (!text || (index === 0 && text.toLowerCase().startsWith('sku'))) {
      return;
    }
    const line = index + 1;
    const [sku, batchCode, bestBefore, quantity] = text
      .split(',')
      .map((cell) => cell.trim());
    if (!sku || !batchCode || !bestBefore || !quantity) {
      throw new BadRequestException(`Line ${line}: expected 4 columns`);
    }
    if (!DATE_PATTERN.test(bestBefore) || isNaN(Date.parse(bestBefore))) {
      throw new BadRequestException(`Line ${line}: invalid bestBefore date`);
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new BadRequestException(`Line ${line}: invalid quantity`);
    }
    rows.push({ line, sku, batchCode, bestBefore, quantity: qty });
  });

  if (rows.length === 0) {
    throw new BadRequestException('CSV contains no rows');
  }
  return rows;
}
