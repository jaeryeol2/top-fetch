import { describe, it, expect, vi } from 'vitest';
import { createRequire } from 'module';
// @ts-expect-error dist mjs bundle does not have declaration file in same directory
import * as esmBundle from '../dist/top-fetch.mjs';

const require = createRequire(import.meta.url);

describe('Bundle Output Verification (top-fetch.mjs & top-fetch.cjs)', () => {
  it('ESM 번들 (dist/top-fetch.mjs) 내보내기 및 실행 정상 검증', async () => {
    expect(esmBundle.topFetch).toBeDefined();
    expect(typeof esmBundle.topFetch).toBe('function');
    expect(typeof esmBundle.topFetch.create).toBe('function');
    expect(typeof esmBundle.getData).toBe('function');
    expect(typeof esmBundle.HttpError).toBe('function');

    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    const res = await esmBundle.topFetch('https://esm-bundle-test.com/api');
    expect(res.status).toBe(200);
    vi.restoreAllMocks();
  });

  it('CJS 번들 (dist/top-fetch.cjs) require() 내보내기 및 실행 정상 검증', async () => {
    const cjsBundle = require('../dist/top-fetch.cjs') as typeof esmBundle;

    expect(cjsBundle.topFetch).toBeDefined();
    expect(typeof cjsBundle.topFetch).toBe('function');
    expect(typeof cjsBundle.topFetch.create).toBe('function');
    expect(typeof cjsBundle.getData).toBe('function');
    expect(typeof cjsBundle.HttpError).toBe('function');

    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify({ ok: true, via: 'cjs' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const res = await cjsBundle.topFetch('https://cjs-bundle-test.com/api');
    expect(res.status).toBe(200);
    const data = await res.getData();
    expect(data).toEqual({ ok: true, via: 'cjs' });
    vi.restoreAllMocks();
  });
});
