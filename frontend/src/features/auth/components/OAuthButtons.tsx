/**
 * OAuthButtons
 * OAuth provider login buttons (Naver, Google, Kakao)
 */

import {
  buildOAuthUrl,
  saveOAuthState,
  type OAuthProviderType,
} from "../utils/oauthUrl";

interface OAuthButtonsProps {
  userRole: string;
  storeId?: string;
}

const PROVIDERS: {
  provider: OAuthProviderType;
  label: string;
  logo: string;
  bgColor: string;
  textColor: string;
}[] = [
  {
    provider: "NAVER",
    label: "네이버 로그인",
    logo: "N",
    bgColor: "bg-[#03C75A]",
    textColor: "text-white",
  },
  {
    provider: "GOOGLE",
    label: "Google로 3초만에 시작하기",
    logo: "/icon/google.svg",
    bgColor: "bg-white border border-slate-300",
    textColor: "text-slate-700",
  },
  {
    provider: "KAKAO",
    label: "카카오 로그인",
    logo: "💬",
    bgColor: "bg-[#FEE500]",
    textColor: "text-[#191919]",
  },
];

// Kakao/Naver require app review before production use
const ENABLED_PROVIDERS: OAuthProviderType[] = ["GOOGLE"];

export function OAuthButtons({ userRole, storeId }: OAuthButtonsProps) {
  const handleClick = (provider: OAuthProviderType) => {
    saveOAuthState({ provider, role: userRole, storeId });
    // eslint-disable-next-line react-hooks/immutability
    window.location.href = buildOAuthUrl(provider);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {PROVIDERS.filter((p) => ENABLED_PROVIDERS.includes(p.provider)).map(
        ({ provider, label, logo, bgColor, textColor }) => (
          <button
            key={provider}
            onClick={() => handleClick(provider)}
            className={`relative flex items-center w-full h-12 rounded-3xl font-medium text-sm transition-opacity hover:opacity-90 active:opacity-80 ${bgColor} ${textColor}`}
          >
            <span className="flex items-center justify-center w-12 h-12">
              {logo.startsWith("/") ? (
                <img src={logo} alt={provider} className="w-6 h-6" />
              ) : (
                <span className="text-lg font-bold">{logo}</span>
              )}
            </span>
            <span className="flex-1 text-center font-bold pr-12">{label}</span>
          </button>
        ),
      )}
    </div>
  );
}
