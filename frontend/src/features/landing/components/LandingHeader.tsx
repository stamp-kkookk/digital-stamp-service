/**
 * LandingHeader
 * 랜딩 페이지 헤더 - 로고 + 로그인 CTA
 */

import { Link } from "react-router-dom";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/20 border-black/5 backdrop-blur-lg">
      <div className="flex items-center justify-between h-16 px-6 mx-auto max-w-7xl">
        {/* Logo */}
        <Link to={"/"} className="flex items-center">
          <img
            src="/logo/logo_text_customer.png"
            alt="kkookk logo"
            className="object-contain w-auto h-30"
          />
        </Link>

        {/* CTA */}
        <Link to="/funnel">
          <button className="flex items-center h-10 px-5 py-2.5 font-semibold text-kkookk-orange-500 transition-all border-2 border-kkookk-orange-500 rounded-lg hover:bg-kkookk-orange-50">
            로그인
          </button>
        </Link>
      </div>
    </header>
  );
}
