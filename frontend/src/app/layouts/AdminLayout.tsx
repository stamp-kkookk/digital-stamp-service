import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { Store as StoreIcon } from "lucide-react";

export function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/simulation");
  };

  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-slate-50">
        {/* 헤더 */}
        <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 bg-slate-900 text-white">
          <Link to="/admin/stores" className="flex items-center gap-2 font-bold text-lg">
            <StoreIcon size={20} />
            KKOOKK Admin
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-300 hover:text-white"
          >
            로그아웃
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* 사이드바 */}
          <aside className="hidden w-64 p-4 bg-white border-r border-slate-200 md:block">
            <div className="space-y-1">
              <button
                onClick={() => navigate("/admin/stores")}
                className="w-full px-4 py-3 font-bold text-left rounded-lg cursor-pointer bg-slate-100 text-slate-800"
              >
                매장 관리
              </button>
            </div>
          </aside>

          {/* 메인 컨텐츠 */}
          <main className="flex flex-col flex-1 min-w-0 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

export default AdminLayout;
