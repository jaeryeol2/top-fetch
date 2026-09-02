/**
 * @vitest-environment happy-dom
 */
import fs from 'fs';
import path from 'path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getData, topFetch } from '../src';

describe('JSP & Template Engines Dual-Mode Environment (JSP, Handlebars, EJS, Thymeleaf)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('JSP CSR Mode / Script Tag (top-fetch.min.js): <script> 태그 로드 후 window.topFetch 동적 AJAX 통신 검증', async () => {
    const randomUser = `jspUser_${Math.random().toString(36).substring(2, 7)}`;
    const mockData = { jspUser: randomUser, role: 'ADMIN' };

    // JSP에서 <script src="top-fetch.min.js"></script> 로드하는 동적 스크립트 실행을 에뮬레이트
    const scriptCode = fs.readFileSync(
      path.resolve(__dirname, '../dist/top-fetch.min.js'),
      'utf-8',
    );
    window.eval(scriptCode);

    const windowTopFetch = (window as unknown as Record<string, unknown>)
      .topFetch as { topFetch: typeof topFetch; getData: typeof getData };

    expect(windowTopFetch).toBeDefined();
    expect(typeof windowTopFetch.topFetch).toBe('function');
    expect(typeof windowTopFetch.getData).toBe('function');

    vi.spyOn(window, 'fetch').mockImplementation(async (url) => {
      expect(url.toString()).toContain(`/jsp/api/data?user=${randomUser}`);
      return new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const res = await windowTopFetch.topFetch('/jsp/api/data', { query: { user: randomUser } });
    const data = await windowTopFetch.getData(res);

    expect(res.status).toBe(200);
    expect(data).toEqual(mockData);
  });

  it('Server Template Engines SSR Mode (EJS/Handlebars/Thymeleaf): SSR 사전 템플릿 바인딩 데이터 페칭 검증', async () => {
    const randomTitle = `Template Render Title ${Math.random().toString(36).substring(2, 6)}`;
    const templateData = { title: randomTitle, items: ['A', 'B'] };

    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify(templateData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const response = await topFetch('http://localhost:8080/api/template-data');
    const parsed = await getData<typeof templateData>(response);

    expect(parsed).toEqual(templateData);
  });
});
