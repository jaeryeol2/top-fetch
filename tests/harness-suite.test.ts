/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { topFetch } from '../src';
import {
  randomString,
  randomInt,
  randomUuid,
  randomHttpStatus,
  randomDelayMs,
  randomQueryParams,
  randomHeaders,
  randomBackoffConfig,
  randomPayload,
  generateCircularData,
  generateBoundaryBinary,
  generatePolymorphicQuery,
  generateExtremeTimeout,
  setupMockFetch,
  loadIifeBundle,
  runDualModeTest,
  assertHeadersPreserved,
  assertInstanceIsolation,
  assertCircularReferenceRejected,
  TargetEnvironment,
  runMatrixSuites,
  generateTestHistoryMarkdown,
} from './harness';

describe('AGENTS.md Test Harness Architecture Verification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Dynamic & Varied Data Generators', () => {
    it('난수/UUID/가변 쿼리/헤더/백오프 설정이 매번 고유하게 생성되는지 검증', () => {
      const id1 = randomInt(100, 500);
      const id2 = randomInt(501, 1000);
      expect(id1).not.toBe(id2);

      const str1 = randomString('prefix');
      const str2 = randomString('prefix');
      expect(str1).not.toBe(str2);
      expect(str1.startsWith('prefix_')).toBe(true);

      const uuid = randomUuid();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

      const status = randomHttpStatus('all');
      expect(status).toBeGreaterThanOrEqual(400);
      expect(status).toBeLessThan(600);

      const delay = randomDelayMs(10, 50);
      expect(delay).toBeGreaterThanOrEqual(10);
      expect(delay).toBeLessThanOrEqual(50);

      const query = randomQueryParams();
      expect(query.filter).toBeDefined();
      expect(typeof query.keyword).toBe('string');

      const headers = randomHeaders();
      expect(headers.Authorization).toMatch(/^Bearer /);

      const backoff = randomBackoffConfig();
      expect(backoff.retries).toBeGreaterThanOrEqual(2);
    });

    it('다양한 페이로드 포맷(JSON, FormData, Blob, Binary, Text, URLSearchParams) 가변 생성 검증', () => {
      const jsonPayload = randomPayload('json');
      expect(jsonPayload.contentType).toBe('application/json');
      expect(jsonPayload.data).toHaveProperty('id');

      const formPayload = randomPayload('formdata');
      expect(formPayload.data).toBeInstanceOf(FormData);

      const blobPayload = randomPayload('blob');
      expect(blobPayload.data).toBeInstanceOf(Blob);

      const binaryPayload = randomPayload('binary');
      expect(binaryPayload.data).toBeInstanceOf(Uint8Array);

      const textPayload = randomPayload('text');
      expect(typeof textPayload.data).toBe('string');

      const urlParamsPayload = randomPayload('urlsearchparams');
      expect(urlParamsPayload.data).toBeInstanceOf(URLSearchParams);
    });
  });

  describe('2. Chaos, Fuzzer & Boundary Generators', () => {
    it('순환 참조 데이터 생성 및 직렬화 차단 검증', async () => {
      const circular = generateCircularData();
      expect(circular.self).toBe(circular);

      await assertCircularReferenceRejected(async () => {
        await topFetch('https://api.harness.test/query-check', {
          query: circular as unknown as Record<string, unknown>,
        });
      });
    });

    it('바이너리 버퍼 및 다형성 쿼리 구조 생성 검증', () => {
      const bin = generateBoundaryBinary(256);
      expect(bin.length).toBe(256);

      const poly = generatePolymorphicQuery();
      expect(poly.queryDate).toBeInstanceOf(Date);
      expect(poly.queryRegex).toBeInstanceOf(RegExp);
      expect(poly.querySet).toBeInstanceOf(Set);
      expect(poly.queryMap).toBeInstanceOf(Map);

      const timeout = generateExtremeTimeout();
      expect([0, 1, 2, 5, 10]).toContain(timeout);
    });
  });

  describe('3. Mock Fetch Controller & Request Capture', () => {
    it('네트워크 요청 캡처, 지연 시뮬레이션, 네이티브 Headers 보존 검증', async () => {
      const dynamicHeaderKey = `X-Custom-${randomString('hdr', 4)}`;
      const dynamicHeaderVal = randomString('val', 10);
      const mockPayload = { result: randomUuid() };

      const mockController = setupMockFetch(globalThis, {
        status: 200,
        responseHeaders: { 'Content-Type': 'application/json' },
        responseBody: JSON.stringify(mockPayload),
      });

      const client = topFetch.create({
        baseURL: 'https://api.harness.test',
        headers: {
          [dynamicHeaderKey]: dynamicHeaderVal,
        },
      });

      const res = await client('/endpoint', {
        method: 'post',
        body: JSON.stringify({ ping: true }),
      });

      const data = await res.getData();
      expect(data).toEqual(mockPayload);
      expect(mockController.getCallCount()).toBe(1);

      const lastCall = mockController.getLastCall();
      expect(lastCall?.method).toBe('POST');
      expect(lastCall?.url).toBe('https://api.harness.test/endpoint');
      assertHeadersPreserved(lastCall?.headers, { [dynamicHeaderKey.toLowerCase()]: dynamicHeaderVal });

      mockController.restore();
    });

    it('재시도(Retry) 전 N회 실패 후 성공 시뮬레이션 컨트롤러 검증', async () => {
      const mockController = setupMockFetch(globalThis, {
        status: 200,
        failCountBeforeSuccess: 2,
        failStatus: 503,
      });

      const res1 = await topFetch('https://api.harness.test/retry-target');
      expect(res1.status).toBe(503);

      const res2 = await topFetch('https://api.harness.test/retry-target');
      expect(res2.status).toBe(503);

      const res3 = await topFetch('https://api.harness.test/retry-target');
      expect(res3.status).toBe(200);
      expect(mockController.getCallCount()).toBe(3);

      mockController.restore();
    });
  });

  describe('4. 8 Target Environments Matrix Runner & Dual-Mode Execution', () => {
    it('8대 타겟 환경 매트릭스 엔진 일괄 실행 검증', async () => {
      const results = await runMatrixSuites([
        {
          environment: TargetEnvironment.VUE_3_CSR,
          execute: async (ctx) => {
            expect(ctx.isBrowser).toBe(true);
          },
        },
        {
          environment: TargetEnvironment.NUXT_3_DUAL,
          execute: async (ctx) => {
            expect(ctx.isDualMode).toBe(true);
          },
        },
        {
          environment: TargetEnvironment.REACT_18_19_CSR,
          execute: async (ctx) => {
            expect(ctx.isBrowser).toBe(true);
          },
        },
        {
          environment: TargetEnvironment.NEXTJS_APP_ROUTER_DUAL,
          execute: async (ctx) => {
            expect(ctx.isDualMode).toBe(true);
          },
        },
        {
          environment: TargetEnvironment.NESTJS_NODEJS_BACKEND,
          execute: async (ctx) => {
            expect(ctx.isNode).toBe(true);
          },
        },
        {
          environment: TargetEnvironment.JSP_LEGACY_HTML_IIFE,
          execute: async (ctx) => {
            expect(ctx.isBrowser).toBe(true);
          },
        },
        {
          environment: TargetEnvironment.SERVER_TEMPLATE_ENGINES,
          execute: async (ctx) => {
            expect(ctx.isDualMode).toBe(true);
          },
        },
        {
          environment: TargetEnvironment.BUNDLE_DIST_INTEGRITY,
          execute: async (ctx) => {
            expect(ctx.isNode).toBe(true);
          },
        },
      ]);

      expect(results.passedCount).toBe(8);
    });

    it('SSR & CSR Dual-Mode 양방향 통합 검증 하네스 실행', async () => {
      const token = randomString('dual-token', 16);

      await runDualModeTest({
        ssr: async () => {
          const mockSsr = setupMockFetch(globalThis, {
            status: 200,
            responseBody: JSON.stringify({ env: 'SSR', serverSide: true }),
          });

          const ssrClient = topFetch.create({ baseURL: 'https://ssr.internal' });
          const res = await ssrClient('/ssr-data');
          const data = (await res.getData<{ env: string }>()) as { env: string };

          expect(data.env).toBe('SSR');
          expect(mockSsr.getCallCount()).toBe(1);
          mockSsr.restore();
        },
        csr: async () => {
          const mockCsr = setupMockFetch(window, {
            status: 200,
            responseBody: JSON.stringify({ env: 'CSR', token }),
          });

          const csrClient = topFetch.create({
            baseURL: 'https://csr.client.app',
            headers: { Authorization: `Bearer ${token}` },
          });
          const res = await csrClient('/csr-data');
          const data = (await res.getData<{ env: string; token: string }>()) as { env: string; token: string };

          expect(data.env).toBe('CSR');
          expect(data.token).toBe(token);
          expect(mockCsr.getCallCount()).toBe(1);
          mockCsr.restore();
        },
      });
    });

    it('JSP / HTML Script Tag IIFE 번들 동적 로드 하네스 검증', async () => {
      const iife = loadIifeBundle(window);
      expect(typeof iife.topFetch).toBe('function');
      expect(typeof iife.getData).toBe('function');

      const mockData = { bundleVerified: true, stamp: Date.now() };
      const mock = setupMockFetch(window, {
        status: 200,
        responseBody: JSON.stringify(mockData),
      });

      const res = await iife.topFetch('https://jsp.server.com/api/bundle-test');
      const data = await iife.getData(res);

      expect(data).toEqual(mockData);
      mock.restore();
    });
  });

  describe('5. Instance Isolation & Architecture Validation', () => {
    it('인스턴스 간 격리성 및 독립 옵션 유지 검증', () => {
      const clientA = topFetch.create({ baseURL: 'https://api-a.com' });
      const clientB = topFetch.create({ baseURL: 'https://api-b.com' });

      assertInstanceIsolation(clientA, clientB);
    });
  });

  describe('6. Reporter & README Markdown Generator', () => {
    it('AGENTS.md 표준 준수 테스트 실행 기록 마크다운 정상 생성 검증', () => {
      const md = generateTestHistoryMarkdown({
        version: 'v1.0.1',
        dateStr: '2026-08-14',
        records: [
          {
            category: '하네스 엔지니어링',
            testFile: 'tests/harness-suite.test.ts',
            totalTests: 10,
            passedTests: 10,
            status: 'Pass',
            details: '8대 타겟 환경 매트릭스, Fuzzer 순환참조 방지, 듀얼 모드 검증',
          },
        ],
      });

      expect(md).toContain('<details open>');
      expect(md).toContain('100% Pass');
      expect(md).toContain('| **하네스 엔지니어링** | `tests/harness-suite.test.ts` | 10 / 10 | ✅ Pass |');
    });
  });
});
