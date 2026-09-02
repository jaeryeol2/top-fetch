/**
 * @file interceptor-helper.ts
 * @description 글로벌 및 요청별 인터셉터 체이닝, 설정 병합 및 Fetch 옵션 결합 헬퍼 모듈입니다.
 * @author 3TOP
 */

import type { FetchInterceptors, TopFetchOptions } from '../@types/fetch-type';

/**
 * 단일 값 혹은 배열로 전달된 인터셉터를 하나의 안전한 배열로 결합하는 제네릭 헬퍼 함수입니다.
 * 중첩 삼항 연산자를 완전히 제거하고 명시적인 if 분기문으로 가독성 및 린트 준수율을 최적화합니다.
 *
 * @template T 인터셉터 함수 타입
 * @param {T | T[]} [base] 기본 설정 인터셉터 (단일 또는 배열)
 * @param {T | T[]} [custom] 호출 시 개별 전달된 인터셉터 (단일 또는 배열)
 * @returns {T[] | undefined} 체이닝된 인터셉터 배열 또는 undefined
 * @author 3TOP
 */
export const composeInterceptors = <T>(
  base?: T | T[],
  custom?: T | T[],
): T[] | undefined => {
  const baseArr: T[] = [];
  if (base) {
    if (Array.isArray(base)) {
      baseArr.push(...base);
    } else {
      baseArr.push(base);
    }
  }

  const customArr: T[] = [];
  if (custom) {
    if (Array.isArray(custom)) {
      customArr.push(...custom);
    } else {
      customArr.push(custom);
    }
  }

  const combined = [...baseArr, ...customArr];

  return combined.length > 0 ? combined : undefined;
};

/**
 * 전역 인터셉터 타겟 객체에 새로운 인터셉터 목록(beforeRequest, afterResponse, onError)을 안전하게 설정합니다.
 *
 * @param {FetchInterceptors} mergeInterceptors 대상 인터셉터 수집 객체
 * @param {FetchInterceptors} interceptors 주입할 인터셉터 객체
 * @author 3TOP
 */
export const setInterceptors = (
  mergeInterceptors: FetchInterceptors,
  interceptors: FetchInterceptors,
): void => {
  if (interceptors.beforeRequest) {
    mergeInterceptors.beforeRequest = Array.isArray(interceptors.beforeRequest)
      ? interceptors.beforeRequest
      : [interceptors.beforeRequest];
  }
  if (interceptors.afterResponse) {
    mergeInterceptors.afterResponse = Array.isArray(interceptors.afterResponse)
      ? interceptors.afterResponse
      : [interceptors.afterResponse];
  }
  if (interceptors.onError) {
    mergeInterceptors.onError = Array.isArray(interceptors.onError)
      ? interceptors.onError
      : [interceptors.onError];
  }
};

/**
 * 전역 인터셉터 설정과 요청별 전달된 개별 TopFetchOptions 옵션을 안전하게 결합 및 병합합니다.
 *
 * @param {FetchInterceptors} mergeInterceptors 전역 인터셉터 객체
 * @param {TopFetchOptions} [options] 요청 시 전달된 개별 옵션
 * @returns {TopFetchOptions} 인터셉터가 병합된 최종 TopFetchOptions 객체
 * @author 3TOP
 */
export const mergeFetchOptions = (
  mergeInterceptors: FetchInterceptors,
  options?: TopFetchOptions,
): TopFetchOptions => {
  const target = { ...options } as TopFetchOptions;

  target.beforeRequest = composeInterceptors(
    mergeInterceptors.beforeRequest,
    options?.beforeRequest,
  );
  target.afterResponse = composeInterceptors(
    mergeInterceptors.afterResponse,
    options?.afterResponse,
  );
  target.onError = composeInterceptors(
    mergeInterceptors.onError,
    options?.onError,
  );

  return target;
};
