/**
 * FooterSection
 * 푸터 섹션 - 회사 정보 및 법적 정보
 */

export function FooterSection() {
  return (
    <footer className="snap-start py-16 text-sm text-white/70 bg-kkookk-navy">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 mb-6 md:flex-row md:justify-between">
          {/* Logo Placeholder */}
          <div className="flex flex-col">
            <div className="shrink-0">
              <img src="./logo/logo-footer.png" alt="꾸욱 로고" width={400} />
            </div>
            <p className="mt-4 ml-6 text-xl font-semibold text-white">
              사장님은 가볍게, 고객은 선명하게 디지털 스탬프 "꾸욱"
            </p>
          </div>

          {/* Links Grid */}
          <div className="flex flex-wrap items-start gap-4 mt-2">
            <div className="flex items-center justify-center w-10 h-10 bg-[#383838] rounded-lg">
              <a
                href="https://github.com/stamp-kkookk/backend/wiki"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <img
                  src="/icon/github.svg"
                  alt="GitHub"
                  className="w-5 h-5"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </a>
            </div>
            <div className="flex items-center justify-center w-10 h-10 bg-[#383838] rounded-lg">
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <img
                  src="/icon/youtube.svg"
                  alt="YouTube"
                  width={30}
                  height={30}
                />
              </a>
            </div>
            <div className="flex items-center justify-center w-10 h-10 bg-[#383838] rounded-lg">
              <a
                href="https://www.instagram.com"
                target="_blank"
                className="transition-opacity hover:opacity-80"
              >
                <img
                  src="/icon/instagram.svg"
                  alt="Instagram"
                  className="w-5 h-5"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </a>
            </div>
            <div className="flex items-center justify-center w-10 h-10 bg-[#383838] rounded-lg">
              <a
                href="https://www.naver.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <img
                  src="/icon/naver.svg"
                  alt="Naver"
                  className="w-5 h-5"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/20">
          <div className="space-y-2 text-xs text-center text-white/50 md:text-left">
            <p>
              (주)꾸욱 | 대표: 안희찬, 정준영, 김나현 | 사업자등록번호:
              123-45-67890
            </p>
            <p>
              통신판매업신고번호: 2026-서울강남-01234 | 주소: 서울특별시 강남구
              테헤란로 123, 45층
            </p>
            <p>이메일: contact@kkookk.io</p>
            <p className="pt-2">© 2026 KKOOKK. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
