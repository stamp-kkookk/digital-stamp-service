/**
 * CustomerLayout
 * 고객 PWA 라우트용 레이아웃 래퍼
 *
 * Pre-login: /stores/:storeId/customer/* (URL storeId)
 * Post-login: /customer/* (sessionStorage storeId)
 */

import { useAuth } from "@/app/providers/AuthProvider";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { PrivacyPolicyModal } from "@/components/shared/PrivacyPolicyModal";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { clearOriginStoreId } from "@/hooks/useCustomerNavigate";
import { getUserInfo } from "@/lib/api/tokenManager";
import { useState } from "react";
import {
  matchPath,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

export function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeId: urlStoreId } = useParams<{ storeId: string }>();
  const { logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setCurrentStoreId] = useState<number | undefined>(undefined);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Pre-login: /stores/:storeId/customer, Post-login: /customer
  const base = urlStoreId ? `/stores/${urlStoreId}/customer` : "/customer";

  const userInfo = getUserInfo();
  const userName = userInfo?.name ? `${userInfo.name}님` : "김고객님";

  const navigateToTab = (tab: string) => {
    switch (tab) {
      case "history":
        navigate(`${base}/history`);
        break;
      case "rewardBox":
        navigate(`${base}/redeems`);
        break;
      case "migrationList":
        navigate(`${base}/migrations`);
        break;
      default:
        navigate(`${base}/wallet`);
    }
  };

  const handleBottomNavClick = (tab: string) => {
    navigateToTab(tab);
  };

  const handlePrivacyPolicy = () => {
    setIsMenuOpen(false);
    setIsPrivacyModalOpen(true);
  };

  const handleLogout = () => {
    clearOriginStoreId();
    logout();
    navigate("/");
  };

  const isMigrationPath = matchPath(
    "/customer/migrations/:id",
    location.pathname,
  );

  return (
    <>
      <MobileFrame
        isMenuOpen={isMenuOpen}
        onMenuClose={() => setIsMenuOpen(false)}
        onPrivacyPolicy={handlePrivacyPolicy}
        onLogout={handleLogout}
        userName={userName}
        showBottomNav={
          !urlStoreId &&
          !location.pathname.includes("/stamp") &&
          !location.pathname.endsWith("/use") &&
          !location.pathname.endsWith("/login") &&
          !isMigrationPath
        }
        onBottomNavClick={handleBottomNavClick}
      >
        <ScrollToTop />
        <Outlet context={{ setIsMenuOpen, setCurrentStoreId }} />
      </MobileFrame>

      <PrivacyPolicyModal
        open={isPrivacyModalOpen}
        onOpenChange={setIsPrivacyModalOpen}
      />
    </>
  );
}

export default CustomerLayout;
