import { describe, it, expect } from 'vitest';
import { validateUrl } from '../src/url-validator.js';
import { AppError, ERROR_CODES } from '@browser-agent/shared';

describe('validateUrl', () => {
  it('allows valid public HTTP and HTTPS URLs', () => {
    expect(() => validateUrl('https://example.com')).not.toThrow();
    expect(() => validateUrl('http://example.org/path?query=1')).not.toThrow();
    expect(() => validateUrl('https://news.ycombinator.com')).not.toThrow();
  });

  it('rejects empty or whitespace URLs', () => {
    expect(() => validateUrl('')).toThrow(AppError);
    expect(() => validateUrl('   ')).toThrow(AppError);
  });

  it('rejects non-http/https protocols', () => {
    try {
      validateUrl('ftp://files.example.com');
    } catch (err: any) {
      expect(err.code).toBe(ERROR_CODES.INVALID_URL);
    }

    try {
      validateUrl('javascript:alert(1)');
    } catch (err: any) {
      expect(err.code).toBe(ERROR_CODES.INVALID_URL);
    }

    try {
      validateUrl('file:///etc/passwd');
    } catch (err: any) {
      expect(err.code).toBe(ERROR_CODES.INVALID_URL);
    }
  });

  it('blocks localhost and loopback IPs (SSRF protection)', () => {
    expect(() => validateUrl('http://localhost:3000')).toThrowError();
    expect(() => validateUrl('http://127.0.0.1:8080')).toThrowError();
    expect(() => validateUrl('http://127.0.0.2')).toThrowError();
    expect(() => validateUrl('http://0.0.0.0')).toThrowError();
  });

  it('blocks private RFC1918 and link-local ranges', () => {
    expect(() => validateUrl('http://10.0.0.1')).toThrowError();
    expect(() => validateUrl('http://172.16.0.1')).toThrowError();
    expect(() => validateUrl('http://192.168.1.1')).toThrowError();
    expect(() => validateUrl('http://169.254.169.254')).toThrowError();
  });

  it('blocks cloud metadata hosts', () => {
    expect(() => validateUrl('http://metadata.google.internal')).toThrowError();
    expect(() => validateUrl('http://instance-data')).toThrowError();
  });
});

