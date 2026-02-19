/**
 * 라우터 설정
 * 모든 앱 라우트를 위한 React Router 설정
 */

import { AdminLayout } from "@/app/layouts/AdminLayout";
import { CustomerLayout } from "@/app/layouts/CustomerLayout";
import { OwnerLayout } from "@/app/layouts/OwnerLayout";
import { LandingPage } from "@/pages/LandingPage";
import { LauncherPage } from "@/pages/LauncherPage";
import { RoleSelectionPage } from "@/pages/RoleSelectionPage";
import { createBrowserRouter, Navigate } from "react-router-dom";

// 고객 페이지
import { CustomerHistoryPage } from "@/pages/customer/CustomerHistoryPage";
import { CustomerLandingPage } from "@/pages/customer/CustomerLandingPage";
import { CustomerSettingsPage } from "@/pages/customer/CustomerSettingsPage";
import { CustomerStoreSelectPage } from "@/pages/customer/CustomerStoreSelectPage";
import { DirectCustomerLoginPage } from "@/pages/customer/DirectCustomerLoginPage";

// 고객 기능 컴포넌트 (페이지로 래핑될 예정)
import { CustomerLoginForm, CustomerSignupForm } from "@/features/auth";
import { RequestStampButton } from "@/features/issuance";
import { MigrationDetail, MigrationForm, MigrationList } from "@/features/migration";
import { RedeemScreen, RewardList } from "@/features/redemption";
import { WalletPage } from "@/features/wallet";

// Admin 페이지
import { AdminStoreDetailPage } from "@/pages/admin/AdminStoreDetailPage";
import { AdminStoreListPage } from "@/pages/admin/AdminStoreListPage";

// 사장님 페이지
import { OwnerLoginPage } from "@/features/auth/pages/OwnerLoginPage";
import { OwnerSignupPage } from "@/features/auth/pages/OwnerSignupPage";
import {
  StampCardCreatePage,
  StampCardEditPage,
  StampCardStatsPage,
  StoreApprovalPage,
  StoreCreatePage,
  StoreDetailPage,
  StoreEditPage,
  StoreHistoryPage,
  StoreListPage,
  StoreMigrationsPage,
} from "@/pages/owner";

export const router = createBrowserRouter([
  // 랜딩 페이지
  {
    path: "/",
    element: <LandingPage />,
  },

  // 시연용 페이지
  {
    path: "/simulation",
    element: <LauncherPage />,
  },

  // 역할 선택 페이지 (진입점)
  {
    path: "/funnel",
    element: <RoleSelectionPage />,
  },

  // 고객 매장 선택 (시뮬레이션 진입점)
  {
    path: "/customer/stores",
    element: <CustomerStoreSelectPage />,
  },

  // 고객 pre-login 라우트 (storeId 기반 — QR 스캔 진입)
  {
    path: "/stores/:storeId/customer",
    element: <CustomerLayout />,
    children: [
      { index: true, element: <CustomerLandingPage /> },
      { path: "login", element: <CustomerLoginForm /> },
      { path: "signup", element: <CustomerSignupForm /> },
    ],
  },

  // 직접 고객 로그인 (storeId 없음 - funnel에서 진입)
  {
    path: "/customer/login",
    element: <CustomerLayout />,
    children: [
      { index: true, element: <DirectCustomerLoginPage /> },
    ],
  },

  // 고객 post-login 라우트 (storeId 없음 — 로그인 후)
  {
    path: "/customer",
    element: <CustomerLayout />,
    children: [
      { index: true, element: <Navigate to="wallet" replace /> },
      { path: "wallet", element: <WalletPage /> },
      { path: "wallet/:cardId/stamp", element: <RequestStampButton /> },
      { path: "history", element: <CustomerHistoryPage /> },
      { path: "redeems", element: <RewardList /> },
      { path: "redeems/:redeemId/use", element: <RedeemScreen /> },
      { path: "migrations", element: <MigrationList /> },
      { path: "migrations/new", element: <MigrationForm /> },
      { path: "migrations/:id", element: <MigrationDetail /> },
      { path: "settings", element: <CustomerSettingsPage /> },
    ],
  },

  // 사장님 로그인 (레이아웃 없음)
  {
    path: "/owner/login",
    element: <OwnerLoginPage />,
  },

  // 사장님 회원가입 (레이아웃 없음)
  {
    path: "/owner/signup",
    element: <OwnerSignupPage />,
  },

  // 사장님 라우트
  {
    path: "/owner",
    element: <OwnerLayout />,
    children: [
      { index: true, element: <Navigate to="stores" replace /> },
      { path: "stores", element: <StoreListPage /> },
      { path: "stores/new", element: <StoreCreatePage /> },
      { path: "stores/:storeId", element: <StoreDetailPage /> },
      { path: "stores/:storeId/edit", element: <StoreEditPage /> },
      { path: "stores/:storeId/history", element: <StoreHistoryPage /> },
      { path: "stores/:storeId/migrations", element: <StoreMigrationsPage /> },
      { path: "stores/:storeId/approval", element: <StoreApprovalPage /> },
      {
        path: "stores/:storeId/stamp-cards/new",
        element: <StampCardCreatePage />,
      },
      {
        path: "stores/:storeId/stamp-cards/:cardId/edit",
        element: <StampCardEditPage />,
      },
      {
        path: "stores/:storeId/stamp-cards/:cardId/stats",
        element: <StampCardStatsPage />,
      },
    ],
  },

  // Admin 라우트
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="stores" replace /> },
      { path: "stores", element: <AdminStoreListPage /> },
      { path: "stores/:storeId", element: <AdminStoreDetailPage /> },
    ],
  },
]);

export default router;
