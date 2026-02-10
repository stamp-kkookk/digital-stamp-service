/**
 * useCustomerNavigate
 * 고객 경로 생성 및 네비게이션 훅
 *
 * Pre-login: /stores/:storeId/customer/* (storeId from URL)
 * Post-login: /customer/* (storeId from sessionStorage)
 */

import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const STORE_ID_KEY = 'customer_storeId';

export function saveOriginStoreId(storeId: string) {
  sessionStorage.setItem(STORE_ID_KEY, storeId);
}

export function clearOriginStoreId() {
  sessionStorage.removeItem(STORE_ID_KEY);
}

export function useCustomerNavigate() {
  const navigate = useNavigate();
  const { storeId: urlStoreId } = useParams<{ storeId: string }>();

  // Pre-login: storeId from URL, Post-login: from sessionStorage
  const storeId = urlStoreId || sessionStorage.getItem(STORE_ID_KEY) || undefined;

  const customerNavigate = useCallback(
    (path: string) => {
      const p = path.startsWith('/') ? path : `/${path}`;
      if (urlStoreId) {
        navigate(`/stores/${urlStoreId}/customer${p}`);
      } else {
        navigate(`/customer${p}`);
      }
    },
    [navigate, urlStoreId],
  );

  const customerPath = useCallback(
    (path: string) => {
      const p = path.startsWith('/') ? path : `/${path}`;
      if (urlStoreId) {
        return `/stores/${urlStoreId}/customer${p}`;
      }
      return `/customer${p}`;
    },
    [urlStoreId],
  );

  return { storeId, customerNavigate, customerPath };
}
