/**
 * TerminalSettingsPage
 * 매장 설정 페이지
 */

import { StoreStatusToggle } from "@/features/terminal/components/StoreStatusToggle";
import { useOutletContext } from "react-router-dom";
import type { StoreStatus } from "@/types/domain";

interface TerminalContextType {
  storeStatus: StoreStatus;
  toggleStoreStatus: () => void;
}

export function TerminalSettingsPage() {
  const { storeStatus, toggleStoreStatus } = useOutletContext<TerminalContextType>();

  return <StoreStatusToggle status={storeStatus} onToggle={toggleStoreStatus} />;
}

export default TerminalSettingsPage;
