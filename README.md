# top-fetch 🚀

> **Native Web Fetch API Wrapper Library**  
> `top-fetch`는 Web 표준 `fetch` API를 기반으로 제작된 경량(Zero-Dependency) 타입안전 HTTP 클라이언트 래퍼 라이브러리입니다.  
> 브라우저(React, Vue 등 CSR), SSR(Next.js, Nuxt 등), Node.js 백엔드 환경 모두에서 유연하게 동작하도록 설계되었습니다.

- **Author**: 3TOP 커머스플랫폼 1본부
- **License**: UNLICENSED (Private Project)

---

## 📌 주요 특징 (Key Features)

- ⚡ **Zero Dependencies & Native Fetch 기반**: 별도의 외부 종속성 없이 브라우저 및 Node.js 네이티브 `fetch` API를 활용합니다.
- 📦 **DUAL ESM & CommonJS 지원**: `tsdown`으로 빌드되어 `.mjs` 및 `.cjs` 번들을 모두 제공합니다.
- 🛠 **인스턴스 생성 (`topFetch.create`)**: `baseURL`, 기본 헤더, 인터셉터, 타임아웃 설정을 캡슐화한 커스텀 클라이언트를 생성할 수 있습니다.
- 🔍 **중첩 쿼리 파라미터 직렬화 (`query`)**: 배열(`tags[0]=ts`), 중첩 객체, Date, Map, Set 등의 파라미터를 자동으로 인코딩 및 URL 쿼리 스트링으로 변환합니다. (순환 참조 감지 포함)
- 📝 **스마트 요청 바디 처리 (`body`)**: Plain Object 입력 시 `Content-Type: application/json` 헤더 추가 및 자동 `JSON.stringify`를 수행하며, `FormData`, `Blob`, `URLSearchParams`는 유지합니다.
- 🪝 **강력한 인터셉터 (`beforeRequest`, `afterResponse`, `onError`)**: 단일 함수 또는 배열 형태의 인터셉터를 체이닝하여 공통 헤더 주입, 토큰 갱신, 에러 로깅 등을 처리합니다.
- ⏱ **타임아웃 & 자동 재시도 (`timeout`, `retry`, `delay`)**: `AbortController` 기반 타임아웃(기본 3,000ms) 및 일시적 오류(408, 429, 5xx 서버 오류 및 네트워크 단절) 발생 시 안전한 자동 재시도 기능을 제공합니다.
- 📄 **스마트 응답 파서 (`getData` & `.getData()`)**: `await topFetch(...).getData()` 직접 체이닝, `response.getData()`, `getData(response)` 헬퍼 함수 모두 지원하며, `Content-Type` 및 응답 상태에 따라 JSON, Blob(이미지, PDF, 바이너리), FormData, Plain Text 등을 자동 판별하여 파싱합니다.

---

## 📥 설치 및 빌드 (Installation & Build)

### 빌드 명령
```bash
npm run build
```
### 📦 빌드 산출물 구조 (`dist/`) 및 파일별 상세 설명

`npm run build` 실행 시 `tsdown` 및 후처리 스크립트에 의해 `dist/` 디렉토리에 런타임 환경별 번들 파일이 생성됩니다.

| 산출물 파일 | 빌드 포맷 | 주요 대상 환경 | 상세 설명 |
| :--- | :--- | :--- | :--- |
| **`dist/top-fetch.mjs`** | **ESM** (ES Module) | React, Vue, Svelte, Next.js App Router, Vite, Nuxt 3 | ESNext 모듈 표준으로 `import { topFetch } from 'top-fetch'` 구문을 사용하는 최신 모듈 번들러 및 SSR 환경 전용 번들입니다. 트리쉐이킹(Tree-shaking)을 지원합니다. |
| **`dist/top-fetch.cjs`** | **CommonJS** (CJS) | Node.js 백엔드 서버 (NestJS, Express, Fastify 등) | Node.js의 `const { topFetch } = require('top-fetch')` 구문 환경에서 동작하는 레거시 및 백엔드 CommonJS 모듈 번들입니다. |
| **`dist/top-fetch.min.js`** | **IIFE** (Minified Global) | JSP, 레거시 HTML, 스크립트 태그 (`<script>`) 로드 환경 | 모듈 번들러가 없는 단일 HTML/JSP 환경에서 `<script src="top-fetch.min.js"></script>`로 직접 로드할 수 있는 경량화 번들입니다. 브라우저 전역 객체 `window.topFetch`에 자동 노출됩니다. |
| **`dist/@types/top-fetch.d.mts`** | **DTS** (TypeScript Declaration) | TypeScript 개발 환경 | IDE(VS Code 등)에서 코드 자동 완성, 타입 검사 및 `TopFetchOptions`, `FetchInterceptors` 등의 타입 사양을 제공하는 선언 파일입니다. |

---

## 💡 사용법 (Usage Examples)

### 1. 기본 요청 (Basic Request)

```typescript
import { topFetch, getData } from 'top-fetch';

// 방법 1) Promise 메서드 직접 체이닝 (가장 추천하는 간결한 방법 🌟)
const users = await topFetch('https://api.example.com/users', {
  query: { page: 1, limit: 10 },
}).getData();

// 방법 2) Response 인스턴스를 받아 .getData() 메서드 직접 호출
const response = await topFetch('https://api.example.com/users');
const usersAlt1 = await response.getData();

// 방법 3) 기존 글로벌 getData(response) 헬퍼 함수 사용
const usersAlt2 = await getData(response);

// POST 요청 (객체 바디 전달 시 Content-Type 자동 설정 및 .getData() 체이닝)
const createdUser = await topFetch('https://api.example.com/users', {
  method: 'post',
  body: { name: 'Hong Gil-dong', email: 'hong@example.com' },
}).getData();
```

#### 🌐 JSP / HTML 환경 (Script Tag 사용)

```html
<!-- dist/top-fetch.min.js 파일을 script 태그로 로드 -->
<script src="/js/dist/top-fetch.min.js"></script>
<script>
  // window.topFetch 전역 객체 사용
  const { topFetch, getData } = window.topFetch;

  async function fetchUsers() {
    // topFetch 직접 체이닝 파싱 (.getData())
    const users = await topFetch('/api/users', { query: { page: 1 } }).getData();
    console.log(users);
  }
</script>
```

### 2. 커스텀 인스턴스 생성 (`topFetch.create`)

`topFetch.create(defaults)`를 사용하면 공통 `baseURL`, 기본 헤더, 타임아웃, 인터셉터 등이 미리 주입된 독립적인 API 클라이언트 인스턴스를 생성할 수 있습니다.

#### ⚙️ 인스턴스 기본 사용법

```typescript
import { topFetch, getData } from 'top-fetch';

// 1. 공통 옵션이 설정된 커스텀 인스턴스 생성
const apiClient = topFetch.create({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  retry: 2,
  delay: 100,
  headers: {
    'X-Client-Version': '1.0.0',
  },
  beforeRequest: (options) => {
    const headers = options.headers as Headers;
    headers.set('Authorization', 'Bearer my-access-token');
  },
  onError: (error) => {
    console.error('[API Error Logged]:', error);
  },
});

// 2. 생성된 인스턴스로 API 호출 (기본 설정 자동 적용)
const response = await apiClient('/v1/products', {
  query: { category: 'electronics' },
});
const products = await getData(response);
```

#### 🔄 인스턴스 옵션 병합 및 인터셉터 체이닝 원리

- **Headers 병합 (`mergeHeaders`)**: `defaults.headers`와 호출 시 전달된 `options.headers`는 네이티브 `Headers` 객체 속성을 유지하며 안전하게 `set()` 처리됩니다.
- **Interceptors 체이닝 (`composeInterceptors`)**: `beforeRequest`, `afterResponse`, `onError` 인터셉터는 기본 설정에 정의된 인터셉터 뒤에 개별 호출 시 넘긴 인터셉터가 순차적으로 결합되어 순서대로 실행됩니다.
- **옵션 덮어쓰기**: `timeout`, `retry`, `delay` 등 일반 값은 호출 시 전달된 개별 옵션이 기본값을 덮어씁니다.

#### 🏢 멀티 테넌트 / 마이크로서비스별 인스턴스 분리

```typescript
// 회원 서비스용 클라이언트
const userApi = topFetch.create({
  baseURL: 'https://user-service.internal',
  timeout: 3000,
});

// 결제 서비스용 클라이언트
const paymentApi = topFetch.create({
  baseURL: 'https://payment-service.internal',
  timeout: 10000,
  retry: 3,
});

const userInfo = await userApi('/profile');
const paymentResult = await paymentApi('/charge', { method: 'post', body: { amount: 50000 } });
```

### 3. 중첩 쿼리 파라미터 직렬화

```typescript
await topFetch('https://api.example.com/search', {
  query: {
    filter: {
      status: 'active',
      tags: ['typescript', 'javascript'],
    },
    page: 2,
  },
});

// 변환된 URL:
// https://api.example.com/search?filter.status=active&filter.tags%5B0%5D=typescript&filter.tags%5B1%5D=javascript&page=2
```

### 4. 타임아웃 및 재시도 전략 (Timeout & Strategy Pattern Retry)

`top-fetch`는 단순 카운터 방식 외에도 **Strategy Pattern(재시도 전략 패턴)**을 탑재하여 지수 백오프(Exponential Backoff), 커스텀 조건부 재시도 정책을 유연하게 주입할 수 있습니다.

```typescript
import { topFetch, exponentialBackoffRetry } from 'top-fetch';

// 1. 기본 재시도 옵션 사용 (하위 호환성 보장)
const response1 = await topFetch('https://api.example.com/flaky', {
  timeout: 2000, // 시도당(per-attempt) 2초 타임아웃
  retry: 3,      // 서버 오류(5xx, 408, 429) 또는 네트워크 에러 시 최대 3회 재시도
  delay: 500,    // 재시도 대기 간격 500ms
});

// 2. Strategy Pattern - 내장 지수 백오프(Exponential Backoff) 전략 사용 🌟
const response2 = await topFetch('https://api.example.com/unstable', {
  retryStrategy: exponentialBackoffRetry({
    maxRetries: 3,
    initialDelay: 100, // 100ms, 200ms, 400ms 지수 백오프
    factor: 2,
    statusCodes: [500, 502, 503, 504], // 해당 서버 오류 코드에서만 선택적 재시도
  }),
});

// 3. Strategy Pattern - 사용자 정의 커스텀 전략 객체 주입
const response3 = await topFetch('https://api.example.com/custom', {
  retryStrategy: {
    shouldRetry: (context) => {
      // 401 Unauthorized 에러 발생 시 재시도 안함
      if (context.response?.status === 401) return false;
      return context.attempt <= 3;
    },
    getDelay: (context) => context.attempt * 200,
  },
});
```

#### 💡 재시도 및 타임아웃 동작 방식 (Retry & Timeout Details)

- **`timeout`은 각 시도당(Per-Attempt) 적용됩니다.** 전체 요청 예산(Total Budget)이 아니므로, `timeout: 3000, retry: 3` 설정 시 각 시도마다 3초의 타임아웃이 개별 적용되어 최악의 경우 (4회 시도 * 3초) + 재시도 지연 시간만큼 소요될 수 있습니다.
- **`beforeRequest`는 매 재시도 시에도 실행됩니다.** 재시도 시에도 인터셉터가 다시 실행되므로, 토큰 갱신이나 헤더 주입이 재시도 요청에서도 온전히 유지됩니다.
- **기본 재시도 필터링:** 기본 `retry: N` 옵션은 `400`, `401`, `404` 등 일반 4xx 클라이언트 에러를 재시도하지 않으며, 일시적 복구 가능성이 있는 **`408`, `429`, `5xx` 서버 에러 및 네트워크 단절 에러**만 재시도합니다.
- **사용자 요청 취소(`signal.abort()`) 시 즉시 중단:** 사용자가 전달한 `AbortSignal`이 취소(`aborted: true`)되면 남아있는 재시도 카운트와 무관하게 모든 재시도가 즉시 중단되고 `AbortError`를 발생시켜 불필요한 중복 트래픽을 방지합니다.
- **요청 바디가 `ReadableStream`인 경우 재시도가 자동으로 차단됩니다.** 스트림은 한 번 소비되면 다시 읽을 수 없어(1회성 소비), 동일한 스트림으로 재시도를 시도하면 두 번째 요청이 반드시 실패합니다. `top-fetch`는 이런 상황에서 `retry`/`retryStrategy` 설정과 무관하게 재시도를 건너뛰고 최초 응답/에러를 그대로 반환하며, 콘솔에 `console.warn`으로 원인을 안내합니다. 스트리밍 업로드에서 재시도가 필요하다면 `Blob`, `ArrayBuffer`, `string`, `FormData`처럼 재사용 가능한 바디 타입을 사용해 주세요.
- **안전 하드캡(Hard Cap):** 재시도는 최대 10회로 제한되며, 10회 도달 시 무한 루프를 방지하기 위해 경고(`console.warn`)와 함께 재시도를 종료합니다.

### 5. 응답 파싱 및 지원 포맷 (`getData`, `HttpError`, `returnError`)

`getData`는 `Content-Type` 헤더를 분석하여 적절한 데이터 타입으로 자동 파싱하며, 스트림 잠김(Locked Body Stream) 방지를 위해 `response.clone()` 기반으로 안전하게 처리됩니다.

```typescript
import { topFetch, getData, HttpError, returnError } from 'top-fetch';

try {
  const response = await topFetch('https://api.example.com/data');
  const data = await getData(response);

  if (!response.ok) {
    throw new HttpError('Request failed', response.status);
  }
  console.log('Parsed Data:', data);
} catch (error) {
  const errorResponse = returnError(error);
  // { status: 500 | status, message: '...', data: null }
}
```

#### 📦 `getData` 자동 지원 `Content-Type` 카테고리

| 카테고리 | 매칭 `Content-Type` 패턴 | 반환 타입 | 상세 내용 |
| :--- | :--- | :--- | :--- |
| **JSON** | `application/json`, `application/problem+json`, `application/ld+json`, `*.json` | `T` (JSON Object/Array) | `await response.json()` 자동 파싱 |
| **바이너리 (Blob)** | `image/*`, `audio/*`, `video/*`, `font/*`, `application/octet-stream`, `pdf`, `zip`, `tar`, `gzip`, `7z`, `rar`, `epub`, `excel`, `word`, `officedocument`, `vnd.ms-` | `Blob` | 파일 다운로드, 이미지/미디어 스트림 |
| **FormData** | `multipart/*`, `application/x-www-form-urlencoded` | `FormData` | `await response.formData()` 자동 파싱 |
| **텍스트 / 스크립트** | `text/*`, `application/xml`, `text/xml`, `application/javascript`, `text/javascript`, `application/typescript`, `application/yaml`, `application/graphql` | `string` | `await response.text()` 자동 파싱 |
| **Empty Body** | 상태코드 `204 No Content`, `205 Reset Content`, 헤더 `Content-Length: 0` | `null` | 바디가 없는 응답에 대해 `null` 반환 |
| **Fallback** | Content-Type 미지정 또는 알 수 없는 형식 | `string \| Blob \| null` | `text()` 시도 후 실패 시 `blob()` 순차적 Fallback |

---

### 6. 프로젝트 전역 커스텀 래퍼 구축 및 타입 커스텀 패턴 (`sampleFetch`)

실무 프로젝트마다 백엔드 API의 응답 구조(Response Envelope - 예: `{ status, message, data }` 또는 `{ code, result, isSuccess }`)가 다를 수 있습니다.  
`top-fetch`는 특정 프로젝트 스키마에 종속되지 않도록 설계되어 있으며, 프로젝트 환경에 맞춰 아래와 같이 전역 응답 타입(`ResponseApi<T>`) 및 커스텀 래퍼 클라이언트를 손쉽게 구성할 수 있습니다. (`examples/sample.ts` 참고)

```typescript
import { topFetch, getData, HttpError, returnError, mergeFetchOptions } from 'top-fetch';
import type { FetchInterceptors, TopFetchOptions } from 'top-fetch';

/**
 * 실무 프로젝트 전역에서 사용하는 백엔드 공통 API 응답 규격 타입 정의 샘플입니다.
 * 프로젝트 사양(예: { code: string, result: T, isSuccess: boolean })에 맞춰 자유롭게 커스텀할 수 있습니다.
 */
export interface ResponseApi<T> {
  status: number;
  message: string;
  data: T | null;
}

/**
 * 프로젝트 전역에서 공유되는 공통 인터셉터 레지스트리 객체입니다.
 */
const globalInterceptors: FetchInterceptors = {
  beforeRequest: [],
  afterResponse: [],
  onError: [],
};

/**
 * topFetch.create()를 이용하여 공통 baseURL, timeout, 헤더가 캡슐화된 싱글톤 API 인스턴스 생성
 */
const baseFetch = topFetch.create({
  baseURL: 'https://api.example.com',
  timeout: 5000,
});

/**
 * Raw Web Native Response 객체를 그대로 반환하는 메서드
 */
const native = (path: string, options?: TopFetchOptions): Promise<Response> => {
  const mergedOptions = mergeFetchOptions(globalInterceptors, options);
  return baseFetch(path, mergedOptions);
};

/**
 * 백엔드 공통 응답 규격(ResponseApi<R>) 형태로 응답을 감싸서 반환하는 Wrap Fetch 메서드
 */
const wrap = async <R = unknown>(
  path: string,
  options?: TopFetchOptions,
): Promise<ResponseApi<R>> => {
  try {
    // 1. 전역 인터셉터와 요청별 개별 옵션 병합
    const mergedOptions = mergeFetchOptions(globalInterceptors, options);

    // 2. HTTP 통신 수행 및 헤더 기반 데이터 파싱 (JSON, Blob, FormData, Text 등)
    const response = await baseFetch(path, mergedOptions);
    const responseData = await getData(response);

    // 3. HTTP 응답 비정상(4xx, 5xx) 상태 감지 시 HttpError 예외 발생
    if (!response.ok) {
      let backendMessage = 'do not get response data.';
      if (responseData && typeof responseData === 'object' && 'message' in responseData) {
        backendMessage = String((responseData as Record<string, unknown>).message);
      } else if (typeof responseData === 'string' && responseData) {
        backendMessage = responseData;
      }
      throw new HttpError(backendMessage, response.status);
    }

    // 4-A. 파일 다운로드 / 바이너리 응답 (Blob) 인 경우
    if (responseData instanceof Blob) {
      return { status: response.status, message: 'success', data: responseData as unknown as R };
    }

    // 4-B. 백엔드에서 이미 { data: ... } 형태로 감싸서 응답한 경우
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      return responseData as ResponseApi<R>;
    }

    // 4-C. 일반 JSON 객체 또는 단일 데이터인 경우 공통 규격으로 포맷팅
    return { status: response.status, message: 'success', data: (responseData ?? null) as R };
  } catch (error) {
    // 5. 예외 발생 시 표준 오류 구조체로 안전하게 변환하여 반환
    return returnError<R>(error);
  }
};

/**
 * 프로젝트 메인 Fetch 클라이언트 엔트리포인트 객체
 */
export const sampleFetch = Object.assign(wrap, { native });
```

---

### 7. 내부 안전 가드 및 SSR 안정성 (Safety & Chaos Guards) 🛡️

`top-fetch`는 예측 불가능한 네트워크 환경 및 복잡한 SSR/CSR 전환 환경에서도 시스템이 다운되거나 무한 루프에 빠지지 않도록 내장 안전 가드를 탑재하고 있습니다.

1. **무한 재시도 핑퐁 차단 (Safety Hard-Cap 10회)**:
   - 잘못 구성된 커스텀 재시도 전략이나 플래키 네트워크로 인한 무한 루프 폭주를 원천 차단하기 위해 **최대 10회 초과 시 재시도를 강제 종료**합니다.
2. **`beforeRequest` 비동기 타임아웃 즉시 차단**:
   - 비동기 인터셉터(토큰 갱신 등) 실행 도중 타임아웃(`options.timeout`)이 초과되면 `Promise.race`를 통해 `AbortSignal` 이벤트를 감지하여 즉시 요청을 중단하고 `AbortError`를 발생시킵니다.
3. **`response.clone()` 스트림 잠김 방지**:
   - `afterResponse` 인터셉터 로깅 및 `getData` 본문 파싱 시 원본 Response 스트림이 잠겨(Locked Body Stream) 재사용이 불가능해지는 문제를 방지하기 위해 내부적으로 `response.clone()`을 체계적으로 활용합니다.

---

## 📖 API Reference

### `topFetch(path, options)` & `topFetch.create(defaults)`

| 함수 / 메서드 | 파라미터 | 반환 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| **`topFetch(path, options)`** | `path: string`, `options?: TopFetchOptions` | `TopFetchPromise` | HTTP 요청을 수행하며, `await topFetch(...).getData()` 체이닝 및 `res.getData()`를 지원하는 확장 Promise를 반환합니다. |
| **`topFetch.create(defaults)`** | `defaults: Omit<TopFetchOptions, 'method' \| 'query' \| 'body'>` | `(path: string, options?: TopFetchOptions) => TopFetchPromise` | 공통 `baseURL`, 기본 헤더, 타임아웃, 인터셉터가 캡슐화된 커스텀 클라이언트 인스턴스 함수를 생성합니다. |

### `TopFetchOptions` (Discriminated Union)

`TopFetchOptions`는 TypeScript의 **Discriminated Union**으로 구성되어 있어, `GET/DELETE` 및 `POST/PUT/PATCH` 메서드 모두에서 `query` 파라미터를 자유롭게 전달할 수 있으며, `body` 옵션은 `POST/PUT/PATCH` 메서드에서 안전하게 허용됩니다.

| 옵션명 | 타입 | 기본값 | 설명 |
| :--- | :--- | :---: | :--- |
| `baseURL` | `string` | `undefined` | 모든 상대 경로에 결합될 기본 URL |
| `method` | `'get' \| 'delete' \| 'post' \| 'put' \| 'patch'` | `'get'` | HTTP 메서드 |
| `query` | `Record<string, unknown> \| object` | `undefined` | 모든 HTTP 요청 시 URL 쿼리 스트링으로 직렬화할 파라미터 객체 (중첩 객체/배열/Map/Set/Date 지원) |
| `body` | `Record<string, unknown> \| BodyInit` | `undefined` | POST / PUT / PATCH 요청 시 전송할 바디 (Object는 자동 JSON 직렬화) |
| `headers` | `HeadersInit` | `undefined` | 요청 헤더 (`mergeHeaders`를 통해 네이티브 Headers 속성 유지) |
| `timeout` | `number` | `3000` | 각 시도당(per-attempt) 요청 타임아웃 (ms) |
| `retry` | `number` | `0` | 일시적 오류(408, 429, 5xx 및 네트워크 에러) 시 단순 재시도 횟수 |
| `delay` | `number` | `0` | 단순 재시도 대기 간격 (ms) |
| `retryStrategy` | `RetryStrategy` | `undefined` | Strategy Pattern 기반 커스텀 재시도 전략 함수/객체 |
| `signal` | `AbortSignal` | `undefined` | 외부 AbortSignal (내부 타임아웃 Signal과 `AbortSignal.any`로 자동 합성, 취소 시 재시도 즉시 중단) |
| `beforeRequest` | `BeforeRequestInterceptorType \| BeforeRequestInterceptorType[]` | `undefined` | 요청 전송 전 실행되는 인터셉터 (매 재시도 시에도 재실행) |
| `afterResponse` | `AfterResponseInterceptorType \| AfterResponseInterceptorType[]` | `undefined` | 응답 수신 직후 실행되는 인터셉터 (`response.clone()` 제공) |
| `onError` | `OnErrorType \| OnErrorType[]` | `undefined` | 통신 실패 및 타임아웃 발생 시 실행되는 에러 인터셉터 |

### 헬퍼 함수 (Helper Functions)

- **`exponentialBackoffRetry(config?): RetryStrategyFunction`**  
  지수 백오프(Exponential Backoff) 기반의 재시도 전략 함수를 생성하는 팩토리 헬퍼입니다.
  
  | 설정 속성 (`config`) | 타입 | 기본값 | 설명 |
  | :--- | :--- | :---: | :--- |
  | `maxRetries` | `number` | `3` | 최대 재시도 횟수 |
  | `initialDelay` | `number` | `100` | 초기 대기 시간 (ms, $100 \times \text{factor}^{\text{attempt}-1}$) |
  | `factor` | `number` | `2` | 지수 증가 배수 |
  | `statusCodes` | `number[]` | `[408, 429, 500, 502, 503, 504]` | 선택적 재시도 대상 HTTP 상태 코드 목록 |

- **`getData<T>(response: Response): Promise<T | Blob | FormData | string | null>`**  
  Response 헤더의 `Content-Type`을 기반으로 데이터를 적절한 타입(JSON, Blob, FormData, Text 등)으로 자동 파싱하는 헬퍼입니다.
- **`composeInterceptors<T>(base, custom): T[] | undefined`**  
  기본 인스턴스의 인터셉터와 개별 요청 시 전달된 인터셉터를 순서대로 안전하게 결합합니다.
- **`setInterceptors(mergeInterceptors, interceptors): void`**  
  대상 인터셉터 레지스트리 객체에 새로운 인터셉터 목록을 안전하게 일괄 등록합니다.
- **`mergeFetchOptions(mergeInterceptors, options): TopFetchOptions`**  
  글로벌 인터셉터와 요청별 개별 옵션을 결합합니다.
- **`HttpError`**  
  HTTP 상태 코드(`status`)와 메시지(`message`)를 보존하는 전용 Error 클래스입니다.
- **`returnError<T = null>(error: unknown): { status: number; message: string; data: T | null }`**  
  발생한 예외(Error 및 HttpError) 객체를 안전한 표준 에러 구조체(`{ status, message, data: null }`)로 일괄 변환합니다.

---

## 🧪 테스트 실행 기록 (Test Execution History)

`top-fetch`는 다양한 런타임 및 프레임워크 호환성을 보장하기 위해 Vitest 기반의 멀티 환경 단위 테스트를 수행합니다.

<details open>
<summary style="font-size: 1.1rem; font-weight: bold; cursor: pointer;">📋 v1.0.2 (2026-09-01) - 코드 리뷰: 순환 참조 탐지 크로스 엔진 결함 수정</summary>

<br />

- **테스트 결과**: **10개 파일 / 76개 테스트 전체 성공 (100% Pass, 회귀 없음)**
- **테스트 환경**: Node.js v26.0.0 / Vitest v4.1.11 / Happy-DOM v20.11.1

#### 🐛 발견된 결함 (코드 리뷰)
- **[`stringifyOrThrowCircular` 순환 참조 탐지가 V8 외 엔진에서 실패]**: `query`에 전달된 값이 `Map`/`Set` 내부에 순환 참조를 포함할 때, `JSON.stringify` 예외 메시지에 `'circular'` 문자열이 포함되는지로 순환 참조 여부를 판별하고 있었음. 이 문구는 V8(Chrome/Node)의 `"Converting circular structure to JSON..."`에서만 일치하며, Firefox(`"cyclic object value"`)와 Safari(`"JSON.stringify cannot serialize cyclic structures."`)는 문구가 달라 매칭되지 않아 `Circular reference detected in query parameters` 예외를 던지지 못하고 해당 쿼리 값이 조용히 `null`로 누락되던 문제. AGENTS.md Core Rule 7(WeakSet 기반 순환 참조 탐지 의무화) 및 8대 타겟 환경(Vue3/React 등 멀티 브라우저 CSR) 검증 요건에 위배됨. 기존 테스트(`tests/csr-react-vue.test.ts`, `tests/harness-suite.test.ts`)는 일반 객체/배열 순환 참조만 다루어 이 케이스를 포착하지 못했음.

#### ✅ 수정 완료
- **[`hasCircularReference` WeakSet 기반 엔진 독립적 순환 참조 탐지로 교체 (src/index.ts) (20260901)]**: `JSON.stringify` 예외 메시지 매칭 방식을 제거하고, `Map`/`Set`/일반 객체 그래프를 `WeakSet`으로 직접 재귀 순회하여 순환 참조를 탐지하도록 `stringifyOrThrowCircular`를 수정. 모든 대상 JS 엔진에서 동일하게 동작하며, `npm run typecheck` / `npm run lint` / `npm test`(10개 파일 76개 테스트) 전수 재검증 완료.

</details>

---

<details>
<summary style="font-size: 1.1rem; font-weight: bold; cursor: pointer;">📋 v1.0.2 (2026-08-21) - 결함 수정 회귀 검증 및 8대 타겟 환경 매트릭스 전수 검증</summary>

<br />

- **테스트 결과**: **10개 파일 / 76개 테스트 전체 성공 (100% Pass)**
- **테스트 환경**: Node.js v26.0.0 / Vitest v4.1.11 / Happy-DOM v20.11.1
- **소요 시간**: 약 17.5초 (Pretest 빌드 포함)

#### 🛠️ 최신(2026-08-21) 결함 수정 회귀 & 8대 환경 매트릭스 전수 검증 이력
- **[Zero-Dependency Native Fetch 빌드 및 번들 무결성 검증 (20260821)]**: `npm run build` 스크립트를 통한 ESM (`top-fetch.mjs`), CJS (`top-fetch.cjs`), IIFE (`top-fetch.min.js`), DTS (`@types/top-fetch.d.mts`) 런타임 번들 재빌드 및 정상 생성 검증 완료.
- **[ESLint 정적 분석 및 TypeScript 타입 무결성 검증 (20260821)]**: `npm run typecheck`, `npm run lint` 규칙 위반 0건 통과.
- **[전체 10개 테스트 스위트 76개 항목 100% Pass 검증 (20260821)]**: 코드리뷰 8건 결함 회귀 검증, Vue 3/React CSR, Next.js/Nuxt SSR & CSR 듀얼모드, NestJS 백엔드 싱글톤, JSP IIFE 스크립트 태그, 서버 템플릿 엔진, 하드코어 스트레스 및 매트릭스 E2E 전수 통과.

| 환경 / 대상 구분 | 테스트 파일 | 실행 테스트 수 | 상태 | 검증 주요 내용 |
| :--- | :--- | :---: | :---: | :--- |
| **코드리뷰 결함 회귀 검증** | `tests/code-review-verification.test.ts` | 8 / 8 | ✅ Pass | beforeRequest 재시도 헤더 유지, signal 취소 즉시 중단, 4xx 재시도 제외, 10회 하드캡 경고, maxRetries 정밀 전달 |
| **ESM & CJS 번들 무결성** | `tests/bundle-dist.test.ts` | 1 / 1 | ✅ Pass | `dist/top-fetch.mjs` (ESM) 및 `dist/top-fetch.cjs` (CJS) 산출물 내보내기 무결성, `topFetch.create` 멀티 테넌트 인스턴스 격리 |
| **Next.js & Nuxt 3 (SSR/CSR)** | `tests/ssr-next-nuxt.test.ts` | 4 / 4 | ✅ Pass | Server Component/Action Fetch & Hydration Client Fetch, per-request 격리 |
| **NestJS / Node.js Backend** | `tests/nestjs-backend.test.ts` | 3 / 3 | ✅ Pass | 싱글톤 서비스 주입, 4xx/5xx 에러 수집, 지수 백오프 Retry, returnError 변환 |
| **JSP & 템플릿 엔진** | `tests/jsp-template-engines.test.ts` | 2 / 2 | ✅ Pass | `dist/top-fetch.min.js` IIFE Script Tag 로드 및 `window.topFetch` 다형성 쿼리, EJS/Handlebars SSR 사전 페칭 |
| **버그픽스 회귀 검증** | `tests/bugfix-regression.test.ts` | 10 / 10 | ✅ Pass | JSON literal `null`, `retry` 네트워크 에러 처리, `ReadableStream` 재시도 가드 등 기 수정 버그 회귀 방지 |
| **Vue 3 / React (CSR)** | `tests/csr-react-vue.test.ts` | 13 / 13 | ✅ Pass | 브라우저 AJAX, 반응형 상태, FormData 업로드, 체이닝 파싱, 다차원 쿼리 직렬화 |
| **하드코어 스트레스 & 엣지** | `tests/hardcore-stress-edge.test.ts` | 17 / 17 | ✅ Pass | 난수 쿼리, 유니코드/이모지, 타임아웃 차단, 스트림 복제 안전성, Fallback HTML 파싱 |
| **하네스 스위트** | `tests/harness-suite.test.ts` | 11 / 11 | ✅ Pass | 동적 시나리오 생성기, 퍼징 페이로드, 인터셉터 파이프라인 검증 |
| **하네스 매트릭스 E2E** | `tests/harness-matrix-e2e.test.ts` | 7 / 7 | ✅ Pass | 8대 타겟 환경 매트릭스 E2E 통합 시나리오 전수 검증 |

</details>

---

<details>
<summary style="font-size: 1.1rem; font-weight: bold; cursor: pointer;">📋 v1.0.2 (2026-08-16) - 버그 수정 및 재시도 안전 가드 추가</summary>

<br />

- **테스트 결과**: **9개 파일 / 66개 테스트 전체 성공 (100% Pass)**
- **테스트 환경**: Node.js v26.0.0 / Vitest v4.1.10 / Happy-DOM v20.11.1

#### 🐛 수정된 버그 (Bug Fixes)
- **[`getData` JSON literal `null` 오파싱 수정]**: `Content-Type: application/json` 응답 바디가 literal `null`일 때, "파싱 실패"와 "정상 파싱된 null"을 구분하지 못해 문자열 `"null"`로 재파싱되던 문제를 sentinel 값 기반 판별로 수정. (`src/helpers/fetch-helper.ts`)
- **[`retry` 옵션이 네트워크 에러에 미적용되던 문제 수정]**: `retryStrategy` 없이 단순 `retry: N` 옵션만 설정한 경우, HTTP 상태 코드 실패는 재시도되지만 fetch 자체가 실패하는 네트워크 에러는 재시도되지 않던 비대칭 동작을 수정. (`src/helpers/fetch-pipeline-helper.ts`)

#### 🛡️ 추가된 안전 가드 (Safety Guards)
- **[`ReadableStream` 바디 재시도 자동 차단]**: 요청 바디가 1회성 소비 `ReadableStream`인 경우, 재시도 시 스트림이 이미 소비되어 반드시 실패하는 문제를 방지하기 위해 재시도를 자동으로 차단하고 `console.warn`으로 원인을 안내하도록 개선. (`src/helpers/fetch-pipeline-helper.ts`)

#### 📄 문서화 (Documentation)
- **[재시도 관련 알려진 제약사항 명시]**: `beforeRequest` 인터셉터가 최초 시도에만 실행되는 동작과 `ReadableStream` 바디 재시도 차단 동작을 README "4. 타임아웃 및 재시도 전략" 섹션에 명시.

</details>

---

<details>
<summary style="font-size: 1.1rem; font-weight: bold; cursor: pointer;">📋 v1.0.1 (2026-08-14) - 코딩 표준(Strict Type Safety, 조건문 분기, for...of 루프 최적화) 적용 및 검증 이력</summary>

<br />

- **테스트 결과**: **6개 파일 / 40개 테스트 전체 성공 (100% Pass)**
- **테스트 환경**: Node.js v26.0.0 / Vitest v4.1.10 / Happy-DOM v20.11.1
- **소요 시간**: 1.10초

#### 🛠️ 금일(2026-08-14) 무작위 동적 가변 검증 및 코딩 표준 반영 완료 이력 (Dynamic Testing History)
- **[코딩 표준 및 반복문 리팩토링 (20260814)]**: `any` 타입 0건 검증, `if` 4개 이하 유지 / 5개 이상 `switch` 전환, 소스코드(`src/index.ts`) 및 단위 테스트 전역의 `forEach`를 `for...of` 및 함수형 고차 메서드(`map`, `filter`, `reduce`)로 리팩토링 완료.
- **[Zero-Dependency Native Fetch 빌드 및 런타임 번들 무결성 검증 (20260814)]**: `npm run build` 스크립트를 통한 ESM (`top-fetch.mjs`), CJS (`top-fetch.cjs`), IIFE (`top-fetch.min.js`) 런타임 번들 재빌드 및 정상 생성 검증 완료.
- **[baseURL 미지정 상대경로 200/404/TypeError 네이티브 검증 (20260814)]**: `baseURL` 미지정 시 임의 호스트 주입 없이 상대 경로 그대로 200 OK 수신, 404 수신 및 Node.js 미해석 네이티브 TypeError 전수 검증 통과.

| 환경 / 대상 구분 | 테스트 파일 | 실행 테스트 수 | 상태 | 검증 주요 내용 |
| :--- | :--- | :---: | :---: | :--- |
| **하드 스트레스 & 동적 무작위** | `tests/hardcore-stress-edge.test.ts` | 17 / 17 | ✅ Pass | 50+ 고빈도 무작위 병렬 동시 요청, 1024 bytes 가변 Uint8Array 바이너리 전송, 난수 기반 Emoji/Date/Map/Set 중첩 쿼리 직렬화, `for...of` 기반 결과 순회 검증, `baseURL` 미지정 상대경로 200/404/TypeError 검증, `exponentialBackoffRetry` 수렴 지연 및 `JSON.parse` 예외 시 `response.clone()` 기반 HTML Fallback Text 정밀 파싱 |
| **ESM & CommonJS 번들** | `tests/bundle-dist.test.ts` | 1 / 1 | ✅ Pass | `dist/top-fetch.mjs` (ESM) 및 `dist/top-fetch.cjs` (CJS) 산출물 내보내기 무결성, `topFetch.create` 멀티 테넌트 3종(Tenant A, B, C) 개별 baseURL/X-Tenant-ID 독립 인스턴스 격리 |
| **React 18/19 & Vue 3 (CSR)** | `tests/csr-react-vue.test.ts` | 13 / 13 | ✅ Pass | `Math.random()` 동적 사용자 GET 쿼리, `FormData`/`File` 업로드, `Blob` 바이너리 다운로드, 다종 Content-Type (Problem JSON `application/problem+json`, WebP `image/webp`) 파싱, 동적 Auth 토큰 주입 |
| **Next.js & Nuxt 3 (SSR & CSR)** | `tests/ssr-next-nuxt.test.ts` | 4 / 4 | ✅ Pass | Next.js App Router Server Component/Server Action (SSR) server-side fetch 바인딩, Hydration 후 Client Component (CSR) 토큰 헤더 주입 및 client state 통신, per-request 멀티 테넌트 격리 |
| **NestJS & Node.js Backend** | `tests/nestjs-backend.test.ts` | 3 / 3 | ✅ Pass | NestJS 서비스 API 클라이언트 싱글톤 주입, HTTP 401/500 에러 수집, `onError` 에러 인터셉터 로깅, 동적 Retry/Delay 백오프 수렴 및 `returnError` 객체 래핑 변환 |
| **JSP & 템플릿 엔진 (EJS/Handlebars/Thymeleaf)** | `tests/jsp-template-engines.test.ts` | 2 / 2 | ✅ Pass | JSP 레거시 환경 `<script src="top-fetch.min.js">` IIFE 로드 및 `window.topFetch` 전역 AJAX (CSR) 통신, EJS/Handlebars/Thymeleaf 템플릿 사전 바인딩 페칭 (SSR) |

</details>

<details>
<summary style="font-size: 1.1rem; font-weight: bold; cursor: pointer;">📋 v1.0.1 (2026-08-07) - SSR & CSR Dual-Mode 동적 검증 및 테스트 이력</summary>

<br />

- **테스트 결과**: **6개 파일 / 38개 테스트 전체 성공 (100% Pass)**
- **테스트 환경**: Node.js v26.0.0 / Vitest v4.1.10 / Happy-DOM v20.11.1
- **소요 시간**: 1.63초

#### 🚨 테스트 실패 및 수정 이력 (Fail & Fix History)
- **[실패 기록]**: `tests/ssr-next-nuxt.test.ts` > `Next.js Server Action / Nuxt SSR & Client Shared` 테스트 수행 중 `getData(res)` 결과가 `undefined`로 반환되며 `AssertionError: expected undefined to be 'tenant-ssr-...'` 발생.
- **[원인 분석]**: Mock `fetch` 응답 생성 시 `Response` 헤더에 `'Content-Type': 'application/json'` 명시가 누락되어 `getData` 헬퍼가 JSON 객체를 자동으로 파싱하지 못함.
- **[수정 완료: tests/ssr-next-nuxt.test.ts (20260807)]**: Mock `Response`에 `Content-Type: application/json` 헤더 명시 추가 및 SSR/CSR Dual Mode 4개 테스트 케이스 정상 통과 완료.

#### 🛠️ 금일(2026-08-07) 무작위 동적 가변 검증 완료 이력 (Dynamic Testing History)
- **[Zero-Dependency Native Fetch 빌드 및 런타임 번들 무결성 검증 (20260807)]**: `npm run build` 스크립트를 통한 ESM (`top-fetch.mjs`), CJS (`top-fetch.cjs`), IIFE (`top-fetch.min.js`) 런타임 번들 재빌드 및 정상 생성 검증 완료.
- **[Next.js / Nuxt 3 & JSP SSR/CSR Dual Mode 동적 검증 (20260807)]**: Server Component/SSR fetch 및 Hydration 후 CSR Client fetch 양방향 통합 동작 무결성 검증 완료.

| 환경 / 대상 구분 | 테스트 파일 | 실행 테스트 수 | 상태 | 검증 주요 내용 |
| :--- | :--- | :---: | :---: | :--- |
| **하드 스트레스 & 동적 무작위** | `tests/hardcore-stress-edge.test.ts` | 15 / 15 | ✅ Pass | 50+ 고빈도 무작위 병렬 동시 요청, 1024 bytes 가변 Uint8Array 바이너리 전송, 난수 기반 Emoji/Date/Map/Set 중첩 쿼리 직렬화, `exponentialBackoffRetry` 수렴 지연 및 `JSON.parse` 예외 시 `response.clone()` 기반 HTML Fallback Text 정밀 파싱 |
| **ESM & CommonJS 번들** | `tests/bundle-dist.test.ts` | 1 / 1 | ✅ Pass | `dist/top-fetch.mjs` (ESM) 및 `dist/top-fetch.cjs` (CJS) 산출물 내보내기 무결성, `topFetch.create` 멀티 테넌트 3종(Tenant A, B, C) 개별 baseURL/X-Tenant-ID 독립 인스턴스 격리 |
| **React 18/19 & Vue 3 (CSR)** | `tests/csr-react-vue.test.ts` | 13 / 13 | ✅ Pass | `Math.random()` 동적 사용자 GET 쿼리, `FormData`/`File` 업로드, `Blob` 바이너리 다운로드, 다종 Content-Type (Problem JSON `application/problem+json`, WebP `image/webp`) 파싱, 동적 Auth 토큰 주입 |
| **Next.js & Nuxt 3 (SSR & CSR)** | `tests/ssr-next-nuxt.test.ts` | 4 / 4 | ✅ Pass | Next.js App Router Server Component/Server Action (SSR) server-side fetch 바인딩, Hydration 후 Client Component (CSR) 토큰 헤더 주입 및 client state 통신, per-request 멀티 테넌트 격리 |
| **NestJS & Node.js Backend** | `tests/nestjs-backend.test.ts` | 3 / 3 | ✅ Pass | NestJS 서비스 API 클라이언트 싱글톤 주입, HTTP 401/500 에러 수집, `onError` 에러 인터셉터 로깅, 동적 Retry/Delay 백오프 수렴 및 `returnError` 객체 래핑 변환 |
| **JSP & 템플릿 엔진 (EJS/Handlebars/Thymeleaf)** | `tests/jsp-template-engines.test.ts` | 2 / 2 | ✅ Pass | JSP 레거시 환경 `<script src="top-fetch.min.js">` IIFE 로드 및 `window.topFetch` 전역 AJAX (CSR) 통신, EJS/Handlebars/Thymeleaf 템플릿 사전 바인딩 페칭 (SSR) |

</details>

<details>
<summary style="font-size: 1.1rem; font-weight: bold; cursor: pointer;">📋 v1.0.1 (2026-08-06) - 2026-08-06 통합 단위 테스트 및 엣지 케이스/동적 무작위 검증 이력</summary>

<br />

- **테스트 결과**: **6개 파일 / 37개 테스트 전체 성공 (100% Pass)**
- **테스트 환경**: Node.js v26.0.0 / Vitest v4.1.10 / Happy-DOM v20.11.1
- **소요 시간**: 1.46초

#### 🛠️ 금일(2026-08-06) 주요 수정 및 검증 완료 이력 (Fix & Enhancement History)
- **[Discriminated Union 스펙 복원: `src/index.ts`, `src/@types/fetch-type.d.ts` (20260806)]**: `GET/DELETE` 메서드는 `query` 전용, `POST/PUT/PATCH` 메서드는 `body` 전용으로 TypeScript 타입 및 `isQuerySupportedMethod` URL 결합 분기 로직 정밀 원복 완료.
- **[response.clone() 스트림 안전성 개선: `src/helpers/fetch-helper.ts`, `src/helpers/fetch-pipeline-helper.ts` (20260806)]**: `afterResponse` 인터셉터 및 `getData` Fallback 파싱 시 body stream locked/already read 예외 방지를 위한 `response.clone()` 적용.
- **[Evil Chaos & Safety Cap 강화: `src/helpers/fetch-pipeline-helper.ts`, `src/index.ts` (20260806)]**: 무한 재시도 핑퐁 폭주 차단(Safety Cap 10회), `beforeRequest` 비동기 수행 중 타임아웃 초과 시 `Promise.race` 즉시 차단, Node.js 상대 경로 가드(`http://localhost` fallback).

| 환경 / 대상 구분 | 테스트 파일 | 실행 테스트 수 | 상태 | 검증 주요 내용 |
| :--- | :--- | :---: | :---: | :--- |
| **하드 스트레스 & 동적 무작위** | `tests/hardcore-stress-edge.test.ts` | 15 / 15 | ✅ Pass | **[Dynamic Varied Test]** 무작위 수량(10~30개) 동적 병렬 요청 및 랜덤 Auth 헤더 결합, GET query & POST body 엄격 분기, 무작위 4xx/5xx 에러, **[Evil Chaos]** 무한 재시도 핑퐁 차단(10회), `beforeRequest` 타임아웃 차단, Node.js 상대경로 가드, `response.clone()` 스트림 안전성 검증 |
| **ESM & CommonJS 번들** | `tests/bundle-dist.test.ts` | 1 / 1 | ✅ Pass | `dist/top-fetch.mjs` 및 `dist/top-fetch.cjs` 모듈 내보내기 무결성, `topFetch.create` 멀티 테넌트 인스턴스 격리 생성 검증 |
| **React 18/19 & Vue 3 (CSR)** | `tests/csr-react-vue.test.ts` | 13 / 13 | ✅ Pass | Strategy Pattern 기반 `exponentialBackoffRetry` 지수 백오프 전략 및 커스텀 `RetryStrategyObject` 조건부 재시도, 다차원 쿼리 배열 직렬화, `baseURL` 끝 슬래시 중복 정규화, 바이너리 바디 검증 |
| **Next.js & Nuxt 3 (SSR)** | `tests/ssr-next-nuxt.test.ts` | 3 / 3 | ✅ Pass | Server-side fetch 바인딩, URL 분기, `topFetch.create` 멀티 테넌트 타임아웃 인스턴스 독립 격리 검증 |
| **NestJS & Node.js Backend** | `tests/nestjs-backend.test.ts` | 3 / 3 | ✅ Pass | `topFetch.create` 싱글톤 연동, HTTP 401 수집, 동적 Retry/Delay 재시도 백오프, `onError` 에러 파이프라인 수집 검증 |
| **JSP & 템플릿 엔진 (EJS/Handlebars/Thymeleaf)** | `tests/jsp-template-engines.test.ts` | 2 / 2 | ✅ Pass | `top-fetch.min.js` IIFE Script Tag 로드 및 `window.topFetch` 전역 통신, SSR 템플릿 데이터 바인딩 무결성 검증 |

</details>

<details>
<summary style="font-size: 1.1rem; font-weight: bold; cursor: pointer;">📋 v1.0.0 (2026-08-05) - TopFetchPromise 직접 체이닝 (await topFetch('...').getData()) 리팩토링 및 가용 Content-Type 검증</summary>

<br />

- **테스트 결과**: **5개 파일 / 16개 테스트 전체 성공 (100% Pass)**
- **테스트 환경**: Node.js v26.0.0 / Vitest v4.1.10 / Happy-DOM v20.11.1
- **소요 시간**: 1.21초

| 환경 / 대상 구분 | 테스트 파일 | 실행 테스트 수 | 상태 | 검증 주요 내용 |
| :--- | :--- | :---: | :---: | :--- |
| **ESM & CommonJS 번들** | `tests/bundle-dist.test.ts` | 1 / 1 | ✅ Pass | `dist/top-fetch.mjs` 모듈 내보내기 및 `topFetch.create` 함수 검증 |
| **React 18/19 & Vue 3 (CSR)** | `tests/csr-react-vue.test.ts` | 7 / 7 | ✅ Pass | `await topFetch('...').getData()` 직접 체이닝, Problem JSON, HTML, WebP, HTTP 500, `HttpError`, `returnError`, 쿼리 순환참조 예외 검증 |
| **Next.js & Nuxt 3 (SSR)** | `tests/ssr-next-nuxt.test.ts` | 3 / 3 | ✅ Pass | Server-side fetch, URL 분기, `topFetch.create` 멀티 테넌트 타임아웃 인스턴스 격리 검증 |
| **NestJS & Node.js Backend** | `tests/nestjs-backend.test.ts` | 3 / 3 | ✅ Pass | `topFetch.create` 싱글톤 연동, HTTP 401 수집, 동적 Retry/Delay, `onError` 로깅 검증 |
| **JSP & 템플릿 엔진 (EJS/Handlebars/Thymeleaf)** | `tests/jsp-template-engines.test.ts` | 2 / 2 | ✅ Pass | `top-fetch.min.js` IIFE Script Tag 로드 및 `window.topFetch` 전역 통신, SSR 템플릿 데이터 바인딩 검증 |

</details>
