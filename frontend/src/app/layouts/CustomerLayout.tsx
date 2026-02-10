/**
 * CustomerLayout
 * 고객 PWA 라우트용 레이아웃 래퍼
 *
 * Pre-login: /stores/:storeId/customer/* (URL storeId)
 * Post-login: /customer/* (sessionStorage storeId)
 */

import { useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { MobileFrame } from '@/components/layout/MobileFrame';
import { useAuth } from '@/app/providers/AuthProvider';
import { clearOriginStoreId } from '@/hooks/useCustomerNavigate';
import { ScrollToTop } from '@/components/shared/ScrollToTop';

export function CustomerLayout() {
  const navigate = useNavigate();
  const { storeId: urlStoreId } = useParams<{ storeId: string }>();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentStoreId, setCurrentStoreId] = useState<number | undefined>(undefined);

  // Pre-login: /stores/:storeId/customer, Post-login: /customer
  const base = urlStoreId ? `/stores/${urlStoreId}/customer` : '/customer';

  const handleMenuItemClick = (screen: string) => {
    setIsMenuOpen(false);
    switch (screen) {
      case 'history': {
        const query = currentStoreId ? `?storeId=${currentStoreId}` : '';
        navigate(`${base}/history${query}`);
        break;
      }
      case 'rewardBox':
        navigate(`${base}/redeems`);
        break;
      case 'migrationList':
        navigate(`${base}/migrations`);
        break;
      case 'settings':
        navigate(`${base}/settings`);
        break;
      default:
        navigate(`${base}/wallet`);
    }
  };

  const handleLogout = () => {
    clearOriginStoreId();
    logout();
    navigate('/');
  };

  return (
    <MobileFrame
      isMenuOpen={isMenuOpen}
      onMenuClose={() => setIsMenuOpen(false)}
      onMenuItemClick={handleMenuItemClick}
      onLogout={handleLogout}
    >
      <ScrollToTop />
      <Outlet context={{ setIsMenuOpen, setCurrentStoreId }} />
    </MobileFrame>
  );
}

export default CustomerLayout;
