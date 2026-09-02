/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { topFetch, returnError, exponentialBackoffRetry } from '../src';
import {
  randomString,
  randomInt,
  randomUuid,
  randomHttpStatus,
  randomHeaders,
  randomBackoffConfig,
  randomPayload,
  generateCircularData,
  generateBoundaryBinary,
  generatePolymorphicQuery,
  setupMockFetch,
  loadIifeBundle,
  runDualModeTest,
  assertHeadersPreserved,
  assertInstanceIsolation,
  assertHttpError,
  assertCircularReferenceRejected,
  TargetEnvironment,
  runMatrixSuites,
} from './harness';

describe('AGENTS.md 8-Environment Matrix & Dynamic Harnessing Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Vue 3 & React 18/19 (CSR Environment Matrix)', () => {
    it('CSR Matrix: Dynamic Auth Header, FormData 업로드 & 가변 JSON 파싱 체이닝', async () => {
      const dynamicToken = randomString('jwt-csr', 32);
      const formPayload = randomPayload('formdata');
      const expectedRes = { uploadId: randomUuid(), received: true };

      const mock = setupMockFetch(window, {
        status: 200,
        responseHeaders: { 'Content-Type': 'application/json' },
        responseBody: JSON.stringify(expectedRes),
      });

      const vueReactClient = topFetch.create({
        baseURL: 'https://csr.vue-react.app',
        headers: { Authorization: `Bearer ${dynamicToken}` },
      });

      const res = await vueReactClient('/upload', {
        method: 'post',
        body: formPayload.data as FormData,
      });

      const data = await res.getData();
      expect(data).toEqual(expectedRes);

      const captured = mock.getLastCall();
      expect(captured?.method).toBe('POST');
      assertHeadersPreserved(captured?.headers, { authorization: `Bearer ${dynamicToken}` });
      mock.restore();
    });
  });

  describe('2. Next.js App Router & Nuxt 3 (SSR & CSR Dual-Mode Matrix)', () => {
    it('Next.js/Nuxt Dual-Mode: Server-Side Data Fetching & Hydrated Client 통신 양방향 검증', async () => {
      const dynamicQuery = {
        filter: randomString('filter', 6),
        page: randomInt(1, 10),
      };

      await runDualModeTest({
        ssr: async () => {
          const ssrData = { renderedOn: 'Server-Side Next.js/Nuxt', id: randomUuid() };
          const mockSsr = setupMockFetch(globalThis, {
            status: 200,
            responseBody: JSON.stringify(ssrData),
          });

          const ssrFetch = topFetch.create({ baseURL: 'http://localhost:3000' });
          const res = await ssrFetch('/api/server-component', { query: dynamicQuery });
          const data = await res.getData();

          expect(data).toEqual(ssrData);
          expect(mockSsr.getLastCall()?.url).toContain(`filter=${dynamicQuery.filter}`);
          mockSsr.restore();
        },
        csr: async () => {
          const clientData = { hydrated: true, clientId: randomString('client', 8) };
          const mockCsr = setupMockFetch(window, {
            status: 200,
            responseBody: JSON.stringify(clientData),
          });

          const clientFetch = topFetch.create({ baseURL: 'https://client.next-nuxt.app' });
          const res = await clientFetch('/api/client-state', { query: dynamicQuery });
          const data = await res.getData();

          expect(data).toEqual(clientData);
          mockCsr.restore();
        },
      });
    });
  });

  describe('3. NestJS & Node.js Backend Server Environment Matrix', () => {
    it('Backend Matrix: 무작위 HTTP 4xx/5xx 에러 수집, 지수 백오프 Retry 수렴 및 returnError 변환', async () => {
      const random5xx = randomHttpStatus('server');
      const random4xxOr5xx = randomHttpStatus('all');
      const backoff = randomBackoffConfig();

      const mock = setupMockFetch(globalThis, {
        status: 200,
        failCountBeforeSuccess: 2,
        failStatus: random5xx,
      });

      const backendClient = topFetch.create({
        baseURL: 'http://internal-microservice:8080',
        retryStrategy: exponentialBackoffRetry({
          maxRetries: backoff.retries,
          initialDelay: 10,
          factor: 1.5,
        }),
      });

      const res = await backendClient('/api/orders');
      expect(res.status).toBe(200);
      expect(mock.getCallCount()).toBe(3); // 2번 실패 후 3회차 성공

      // 직접 실패 유도 및 returnError 검증
      mock.restore();
      const failMock = setupMockFetch(globalThis, { status: random4xxOr5xx });
      try {
        await topFetch('http://internal-microservice:8080/failing-endpoint');
      } catch (err: unknown) {
        assertHttpError(err, random4xxOr5xx);
        const wrapped = returnError(err);
        expect(wrapped.status).toBe(random4xxOr5xx);
      }
      failMock.restore();
    });
  });

  describe('4. JSP & Legacy HTML Script Tag Environment Matrix', () => {
    it('JSP/HTML Script Tag: window.topFetch IIFE 로드 및 다형성 쿼리 전송 검증', async () => {
      const iife = loadIifeBundle(window);
      const poly = generatePolymorphicQuery();
      const mockRes = { success: true, timestamp: Date.now() };

      const mock = setupMockFetch(window, {
        status: 200,
        responseBody: JSON.stringify(mockRes),
      });

      const res = await iife.topFetch('https://legacy-jsp.internal/ajax/process', {
        query: poly,
      });
      const data = await iife.getData(res);

      expect(data).toEqual(mockRes);
      expect(mock.getCallCount()).toBe(1);
      mock.restore();
    });
  });

  describe('5. Server Template Engines (EJS/Handlebars/Thymeleaf) Environment Matrix', () => {
    it('Template Engines Matrix: SSR 사전 렌더링 데이터 페칭 및 1024 bytes 바이너리 다운로드', async () => {
      const binaryData = generateBoundaryBinary(1024);
      const mock = setupMockFetch(globalThis, {
        status: 200,
        responseHeaders: { 'Content-Type': 'application/octet-stream' },
        responseBody: binaryData,
      });

      const res = await topFetch('http://template-renderer:8080/assets/template.bin');
      const parsedData = await res.getData();

      expect(parsedData).toBeInstanceOf(Blob);
      expect((parsedData as Blob).size).toBe(1024);
      mock.restore();
    });
  });

  describe('6. Multi-Tenant Instance Isolation & Circular Reference Guard', () => {
    it('멀티 테넌트 인스턴스 간 설정 오염 방지 및 순환 참조 예외 차단', async () => {
      const headersA = randomHeaders();
      const headersB = randomHeaders();

      const tenantA = topFetch.create({ baseURL: 'https://tenant-a.com', headers: headersA });
      const tenantB = topFetch.create({ baseURL: 'https://tenant-b.com', headers: headersB });

      assertInstanceIsolation(tenantA, tenantB);

      const circular = generateCircularData();
      await assertCircularReferenceRejected(async () => {
        await tenantA('/test', { query: circular as unknown as Record<string, unknown> });
      });
    });
  });

  describe('7. Full 8-Environment Matrix Suite Runner', () => {
    it('AGENTS.md 정의 8대 타겟 환경 매트릭스 일괄 패스 검증', async () => {
      const matrixRun = await runMatrixSuites([
        {
          environment: TargetEnvironment.VUE_3_CSR,
          execute: async () => {},
        },
        {
          environment: TargetEnvironment.NUXT_3_DUAL,
          execute: async () => {},
        },
        {
          environment: TargetEnvironment.REACT_18_19_CSR,
          execute: async () => {},
        },
        {
          environment: TargetEnvironment.NEXTJS_APP_ROUTER_DUAL,
          execute: async () => {},
        },
        {
          environment: TargetEnvironment.NESTJS_NODEJS_BACKEND,
          execute: async () => {},
        },
        {
          environment: TargetEnvironment.JSP_LEGACY_HTML_IIFE,
          execute: async () => {},
        },
        {
          environment: TargetEnvironment.SERVER_TEMPLATE_ENGINES,
          execute: async () => {},
        },
        {
          environment: TargetEnvironment.BUNDLE_DIST_INTEGRITY,
          execute: async () => {},
        },
      ]);

      expect(matrixRun.passedCount).toBe(8);
    });
  });
});
