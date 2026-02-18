/**
 * RoleSelectionPage
 * 역할 선택 페이지 - 고객 vs 사장님 로그인 선택
 */

import { useNavigate } from "react-router-dom";
import { User, Store } from "lucide-react";

export function RoleSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            꾸욱에 오신 것을 환영합니다
          </h1>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Card */}
          <button
            onClick={() => navigate("/customer/login")}
            className="group p-8 bg-white border-2 border-gray-200 rounded-2xl hover:border-kkookk-orange-500 hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-transparent rounded-full flex items-center justify-center group-hover:bg-kkookk-orange-100 transition-colors duration-300">
                <User className="w-10 h-10 text-kkookk-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  고객으로 시작
                </h2>
                <p className="text-gray-600">
                  내 지갑을 확인하고 스탬프를 적립하세요
                </p>
              </div>
            </div>
          </button>

          {/* Owner Card */}
          <button
            onClick={() => navigate("/owner/login")}
            className="group p-8 bg-white border-2 border-gray-200 rounded-2xl hover:border-kkookk-indigo-500 hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-transparent rounded-full flex items-center justify-center group-hover:bg-kkookk-indigo-100 transition-colors duration-300">
                <Store className="w-10 h-10 text-kkookk-indigo-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  사장님으로 시작
                </h2>
                <p className="text-gray-600">
                  매장을 관리하고 고객을 확인하세요
                </p>
              </div>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}

export default RoleSelectionPage;
