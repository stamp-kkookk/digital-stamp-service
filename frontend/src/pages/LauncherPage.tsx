/**
 * LauncherPage 컴포넌트
 * 앱 모드 선택을 위한 개발용 런처 페이지
 */

import { LauncherCard } from "@/components/shared/LauncherCard";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LauncherPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-kkookk-sand">
      <h1 className="mb-2 text-3xl font-bold text-kkookk-navy">
        KKOOKK 시뮬레이터
      </h1>
      <p className="mb-10 text-center text-kkookk-steel">
        각 디바이스 환경을 선택하여 시뮬레이션을 시작하세요.
      </p>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        <LauncherCard
          icon={<Smartphone size={40} />}
          title="고객용 PWA"
          desc="스탬프 적립, 리워드 확인, 적립 요청"
          onClick={() => navigate("/customer/stores")}
          color="bg-kkookk-orange-500"
        />
        <LauncherCard
          icon={<Tablet size={40} />}
          title="매장용 태블릿"
          desc="적립/사용 요청 실시간 승인, 영업 관리"
          onClick={() => navigate("/terminal/login")}
          color="bg-gray-500"
        />
        <LauncherCard
          icon={<Monitor size={40} />}
          title="사장님 백오피스"
          desc="스탬프 카드 설계, 스토어 관리"
          onClick={() => navigate("/owner/login")}
          color="bg-kkookk-indigo"
        />
      </div>

      <p className="mt-12 text-sm text-kkookk-steel">
        Tip: 고객 앱에서 적립 요청 후 매장 태블릿에서 승인해보세요.
      </p>
    </div>
  );
}

export default LauncherPage;
