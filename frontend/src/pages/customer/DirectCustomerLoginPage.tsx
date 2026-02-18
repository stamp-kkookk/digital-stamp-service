/**
 * DirectCustomerLoginPage
 * 직접 고객 로그인 페이지 (storeId 없이 진입)
 * 기존 CustomerLoginForm과 동일한 UI 사용
 */

import { CustomerLoginForm } from "@/features/auth/components/CustomerLoginForm";

export function DirectCustomerLoginPage() {
  return <CustomerLoginForm />;
}

export default DirectCustomerLoginPage;
