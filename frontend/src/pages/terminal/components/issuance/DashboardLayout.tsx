import { BellIcon, CogIcon, HomeIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

const Sidebar = () => {
  // Add state for active menu item if needed
  return (
    <aside className="w-64 bg-kkookk-navy text-white flex flex-col">
      <div className="h-16 flex items-center justify-center font-bold text-xl">KKOOKK</div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <a
          href="#"
          className="flex items-center px-4 py-2 text-white bg-kkookk-navy/80 rounded-xl"
        >
          <HomeIcon className="h-6 w-6 mr-3" />
          실시간 승인 대기
        </a>
        <a href="#" className="flex items-center px-4 py-2 text-kkookk-steel-100 hover:bg-kkookk-navy/80 rounded-xl">
          <PresentationChartLineIcon className="h-6 w-6 mr-3" />
          적립 히스토리
        </a>
        <a href="#" className="flex items-center px-4 py-2 text-kkookk-steel-100 hover:bg-kkookk-navy/80 rounded-xl">
          <CogIcon className="h-6 w-6 mr-3" />
          단말 설정
        </a>
      </nav>
    </aside>
  );
};

const Header = ({ storeName, terminalId }: { storeName?: string; terminalId?: string }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-semibold text-kkookk-navy">{storeName || '매장 정보 로딩 중...'}</h1>
        <p className="text-sm text-kkookk-steel">Terminal: {terminalId || 'N/A'}</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-kkookk-green">
          <span className="h-3 w-3 bg-kkookk-green rounded-full animate-pulse"></span>
          <span>SYSTEM ONLINE</span>
        </div>
        <div className="text-kkookk-steel">{currentTime.toLocaleTimeString()}</div>
        <button className="text-kkookk-steel hover:text-kkookk-navy">
          <BellIcon className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

const DashboardLayout = ({
  children,
  storeName,
  terminalId,
}: {
  children: React.ReactNode;
  storeName?: string;
  terminalId?: string;
}) => {
  return (
    <div className="flex h-screen bg-kkookk-paper">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header storeName={storeName} terminalId={terminalId} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-kkookk-paper p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
