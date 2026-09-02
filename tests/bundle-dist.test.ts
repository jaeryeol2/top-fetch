import { describe, it, expect, vi } from 'vitest';
// @ts-expect-error dist mjs bundle does not have declaration file in same directory
import * as esmBundle from '../dist/top-fetch.mjs';

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
  });
});
