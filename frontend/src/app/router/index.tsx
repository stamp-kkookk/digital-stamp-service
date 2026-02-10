/**
 * 라우터 설정
 * 모든 앱 라우트를 위한 React Router 설정
 */

import { CustomerLayout } from "@/app/layouts/CustomerLayout";
import { OwnerLayout } from "@/app/layouts/OwnerLayout";
import { TerminalLayout } from "@/app/layouts/TerminalLayout";
import { LandingPage } from "@/pages/LandingPage";
import { LauncherPage } from "@/pages/LauncherPage";
import { createBrowserRouter, Navigate } from "react-router-dom";

// 고객 페이지
import { CustomerHistoryPage } from "@/pages/customer/CustomerHistoryPage";
import { CustomerLandingPage } from "@/pages/customer/CustomerLandingPage";
import { CustomerSettingsPage } from "@/pages/customer/CustomerSettingsPage";
import { CustomerStoreSelectPage } from "@/pages/customer/CustomerStoreSelectPage";

// 고객 기능 컴포넌트 (페이지로 래핑될 예정)
import { CustomerLoginForm, CustomerSignupForm } from "@/features/auth";
import { RequestStampButton } from "@/features/issuance";
import { MigrationForm, MigrationList } from "@/features/migration";
import { RedeemScreen, RewardList } from "@/features/redemption";
import { CardDetailView, WalletPage } from "@/features/wallet";

// 사장님 페이지
import { OwnerLoginPage } from "@/features/auth/pages/OwnerLoginPage";
import {
  StampCardCreatePage,
  StampCardEditPage,
  StampCardStatsPage,
  StoreCreatePage,
  StoreDetailPage,
  StoreHistoryPage,
  StoreListPage,
  StoreMigrationsPage,
} from "@/pages/owner";

// 터미널 페이지
import {
  TerminalApprovalPage,
  TerminalHistoryPage,
  TerminalLoginPage,
  TerminalSettingsPage,
  TerminalStoreSelectPage,
} from "@/pages/terminal";

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

  // 고객 post-login 라우트 (storeId 없음 — 로그인 후)
  {
    path: "/customer",
    element: <CustomerLayout />,
    children: [
      { index: true, element: <Navigate to="wallet" replace /> },
      { path: "wallet", element: <WalletPage /> },
      { path: "wallet/:cardId", element: <CardDetailView /> },
      { path: "wallet/:cardId/stamp", element: <RequestStampButton /> },
      { path: "history", element: <CustomerHistoryPage /> },
      { path: "redeems", element: <RewardList /> },
      { path: "redeems/:redeemId/use", element: <RedeemScreen /> },
      { path: "migrations", element: <MigrationList /> },
      { path: "migrations/new", element: <MigrationForm /> },
      { path: "settings", element: <CustomerSettingsPage /> },
    ],
  },

  // 사장님 로그인 (레이아웃 없음)
  {
    path: "/owner/login",
    element: <OwnerLoginPage />,
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
      { path: "stores/:storeId/history", element: <StoreHistoryPage /> },
      { path: "stores/:storeId/migrations", element: <StoreMigrationsPage /> },
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

  // 터미널 로그인 (레이아웃 없음)
  {
    path: "/terminal/login",
    element: <TerminalLoginPage />,
  },

  // 터미널 매장 선택 (레이아웃 없음)
  {
    path: "/terminal/stores",
    element: <TerminalStoreSelectPage />,
  },

  // 터미널 라우트 (레이아웃 포함)
  {
    path: "/terminal",
    element: <TerminalLayout />,
    children: [
      { path: ":storeId", element: <Navigate to="approval" replace /> },
      { path: ":storeId/approval", element: <TerminalApprovalPage /> },
      { path: ":storeId/history", element: <TerminalHistoryPage /> },
      { path: ":storeId/settings", element: <TerminalSettingsPage /> },
    ],
  },
]);

export default router;
