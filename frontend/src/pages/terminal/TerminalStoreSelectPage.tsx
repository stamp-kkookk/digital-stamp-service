/**
 * TerminalStoreSelectPage
 * 로그인 후 관리 매장을 선택하는 화면
 * 매장 선택 시 터미널 JWT를 발급받아 terminal API 접근 가능
 */

import { useStores } from "@/features/store-management/hooks/useStore";
import { useTerminalLogin } from "@/features/terminal/hooks/useTerminal";
import { useAuth } from "@/app/providers/AuthProvider";
import { getTerminalCredentials, clearTerminalCredentials } from "./TerminalLoginPage";
import { AlertCircle, Loader2, LogOut, MapPin, Store } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function TerminalStoreSelectPage() {
  const navigate = useNavigate();
  const { logout, refreshAuthState } = useAuth();
  const { data: stores, isLoading, error } = useStores();
  const terminalLogin = useTerminalLogin();
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const activeStores = stores?.filter((s) => s.status === "ACTIVE") ?? [];
  const inactiveStores = stores?.filter((s) => s.status !== "ACTIVE") ?? [];

  const handleSelect = (storeId: number) => {
    const cred = getTerminalCredentials();
    if (!cred) {
      // 자격증명이 없으면 로그인 화면으로
      navigate("/terminal/login");
      return;
    }

    setSelectingId(storeId);
    setLoginError(null);

    // 터미널 전용 JWT 발급
    terminalLogin.mutate(
      {
        email: cred.email,
        password: cred.password,
        storeId,
      },
      {
        onSuccess: () => {
          clearTerminalCredentials();
          refreshAuthState();
          navigate(`/terminal/${storeId}/approval`);
        },
        onError: () => {
          setSelectingId(null);
          setLoginError("터미널 인증에 실패했습니다. 다시 로그인해주세요.");
        },
      }
    );
  };

  const handleLogout = () => {
    clearTerminalCredentials();
    logout();
    navigate("/terminal/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-kkookk-navy">
      <div className="w-full max-w-lg">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">매장 선택</h1>
          <p className="mt-2 text-sm text-slate-400">
            관리할 매장을 선택해주세요
          </p>
        </div>

        {/* 에러 메시지 */}
        {loginError && (
          <div className="flex items-center gap-2 p-4 mb-4 text-sm text-red-700 bg-red-50 rounded-xl">
            <AlertCircle size={16} className="shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        {/* 로딩 */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <p className="mt-4 text-sm text-slate-400">
              매장 목록을 불러오는 중...
            </p>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="p-8 text-center bg-white rounded-2xl">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
            <p className="mt-4 text-kkookk-steel">
              매장 목록을 불러올 수 없습니다.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 mt-4 text-sm font-bold border rounded-lg border-slate-200 text-kkookk-navy hover:bg-slate-50"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 매장 목록 */}
        {!isLoading && !error && (
          <>
            {stores?.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl">
                <p className="text-kkookk-steel">등록된 매장이 없습니다.</p>
                <p className="mt-2 text-sm text-slate-400">
                  백오피스에서 매장을 먼저 등록해주세요.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => handleSelect(store.id)}
                    disabled={selectingId !== null}
                    className="flex items-center w-full gap-4 p-5 text-left transition-all bg-white shadow-sm rounded-2xl hover:shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-kkookk-indigo/10">
                      {selectingId === store.id ? (
                        <Loader2 className="w-6 h-6 animate-spin text-kkookk-indigo" />
                      ) : (
                        <Store className="w-6 h-6 text-kkookk-indigo" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold truncate text-kkookk-navy">
                          {store.name}
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold text-green-700 bg-green-100 rounded shrink-0">
                          영업중
                        </span>
                      </div>
                      {store.address && (
                        <p className="flex items-center gap-1 mt-1 text-xs truncate text-kkookk-steel">
                          <MapPin size={10} className="shrink-0" />
                          {store.address}
                        </p>
                      )}
                    </div>
                    <svg
                      className="w-5 h-5 shrink-0 text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))}

                {inactiveStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => handleSelect(store.id)}
                    disabled={selectingId !== null}
                    className="flex items-center w-full gap-4 p-5 text-left transition-all bg-white/60 rounded-2xl hover:bg-white/80 disabled:opacity-60"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100">
                      {selectingId === store.id ? (
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                      ) : (
                        <Store className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold truncate text-slate-500">
                          {store.name}
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 rounded shrink-0">
                          비활성
                        </span>
                      </div>
                      {store.address && (
                        <p className="flex items-center gap-1 mt-1 text-xs truncate text-slate-400">
                          <MapPin size={10} className="shrink-0" />
                          {store.address}
                        </p>
                      )}
                    </div>
                    <svg
                      className="w-5 h-5 shrink-0 text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 mx-auto mt-8 text-sm text-slate-400 hover:text-white"
        >
          <LogOut size={14} /> 로그아웃
        </button>
      </div>
    </div>
  );
}

export default TerminalStoreSelectPage;
