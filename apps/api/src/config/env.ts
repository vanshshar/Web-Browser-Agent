import dotenv from 'dotenv';
import path from 'path';
import { AppConfigSchema, type AppConfig } from '@browser-agent/shared';

// Look for .env in current working dir or workspace root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

let config: AppConfig | null = null;

export function loadConfig(): AppConfig {
  const result = AppConfigSchema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');
    throw new Error(`Configuration validation failed: ${errorDetails}`);
  }
  config = result.data;
  return config;
}

export function getConfig(): AppConfig {
  if (!config) {
    return loadConfig();
  }
  return config;
}
