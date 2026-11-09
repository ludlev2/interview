import { existsSync } from 'node:fs';
import { join } from 'node:path';

const envFile = join(__dirname, '..', '.env');
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

export const config = {
  port: Number(process.env.PORT ?? 3101),
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgres://munch:munch@localhost:55431/munch_market',
  jwtSecret: process.env.JWT_SECRET ?? 'changeme',
  jwtExpiresIn: 7 * 24 * 60 * 60,
  webUrl: process.env.WEB_URL ?? 'http://localhost:5181',
  apiUrl: process.env.API_URL ?? 'http://localhost:3101',
  pspWebhookSecret: process.env.PSP_WEBHOOK_SECRET ?? 'whsec_dev_munch_market',
};
