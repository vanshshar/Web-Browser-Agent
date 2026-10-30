import { lookup } from 'node:dns/promises';
import { AppError, ERROR_CODES } from '@browser-agent/shared';

const BLOCKED_HOSTNAMES = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'metadata.google',
  'instance-data',
  '169.254.169.254',
];

const BLOCKED_IP_REGEXES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^fc00:/i,
  /^fe80:/i,
  /^fd/i,
  /^::1$/,
];

export function validateUrl(inputUrl: string): { valid: true; parsed: URL } {
  if (!inputUrl || typeof inputUrl !== 'string' || inputUrl.trim().length === 0) {
    throw new AppError({
      code: ERROR_CODES.INVALID_URL,
      statusCode: 400,
      message: 'URL must not be empty.',
      userMessage: 'The provided URL is empty or invalid.',
    });
  }

  let parsed: URL;
  try {
    parsed = new URL(inputUrl.trim());
  } catch {
    throw new AppError({
      code: ERROR_CODES.INVALID_URL,
      statusCode: 400,
      message: `Invalid URL format: ${inputUrl}`,
      userMessage: 'Invalid URL format.',
    });
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new AppError({
      code: ERROR_CODES.INVALID_URL,
      statusCode: 400,
      message: `Unsupported protocol '${parsed.protocol}'. Only http: and https: are allowed.`,
      userMessage: 'Only HTTP and HTTPS URLs are permitted.',
    });
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    throw new AppError({
      code: ERROR_CODES.URL_BLOCKED,
      statusCode: 403,
      message: `Navigation to blocked hostname '${hostname}' is prohibited.`,
      userMessage: 'Access to local or restricted network endpoints is blocked.',
    });
  }

  for (const regex of BLOCKED_IP_REGEXES) {
    if (regex.test(hostname)) {
      throw new AppError({
        code: ERROR_CODES.URL_BLOCKED,
        statusCode: 403,
        message: `Navigation to private or internal IP '${hostname}' is prohibited.`,
        userMessage: 'Access to private or internal network addresses is blocked.',
      });
    }
  }

  return { valid: true, parsed };
}

export async function validateUrlAsync(inputUrl: string): Promise<{ valid: true; parsed: URL }> {
  const result = validateUrl(inputUrl);
  const addresses = await lookup(result.parsed.hostname, { all: true }).catch(() => []);

  if (addresses.length > 0 && addresses.every(({ address }) => {
    return BLOCKED_IP_REGEXES.some((regex) => regex.test(address));
  })) {
    throw new AppError({
      code: ERROR_CODES.URL_BLOCKED,
      statusCode: 403,
      message: `Navigation to hostname '${result.parsed.hostname}' resolves only to blocked network addresses.`,
      userMessage: 'Access to local or restricted network endpoints is blocked.',
    });
  }

  return result;
}

