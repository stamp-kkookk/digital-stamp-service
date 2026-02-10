/**
 * OwnerLayout
 * 사장님 백오피스 라우트용 레이아웃 래퍼
 */

import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { ScrollToTop } from "@/components/shared/ScrollToTop";

export function OwnerLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/simulation");
  };

  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-kkookk-sand">
        {/* 헤더 */}
        <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200">
        <Link to={"/owner/stores"} className="flex items-center">
          <img
            src="/logo/logo_text_owner.png"
            alt="kkookk owner logo"
            className="object-contain w-auto mt-2 h-30"
          />
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-kkookk-steel hover:text-kkookk-navy"
        >
          로그아웃
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 */}
        <aside className="hidden w-64 p-4 bg-white border-r border-slate-200 md:block">
          <div className="space-y-1">
            <button
              onClick={() => navigate("/owner/stores")}
              className="w-full px-4 py-3 font-bold text-left rounded-lg cursor-pointer bg-blue-50 text-kkookk-indigo"
            >
              스토어 관리
            </button>
          </div>
        </aside>

        {/* 메인 컨텐츠 */}
        <main className="flex flex-col flex-1 min-w-0 overflow-y-auto bg-kkookk-sand">
          <Outlet />
        </main>
      </div>
      </div>
    </>
  );
}

export default OwnerLayout;
