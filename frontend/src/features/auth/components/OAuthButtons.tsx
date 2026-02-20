/**
 * OAuthButtons
 * OAuth provider login buttons (Naver, Google, Kakao)
 */

import {
  buildOAuthUrl,
  saveOAuthState,
  type OAuthProviderType,
} from '../utils/oauthUrl';

interface OAuthButtonsProps {
  role: string;
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
    provider: 'NAVER',
    label: '네이버 로그인',
    logo: 'N',
    bgColor: 'bg-[#03C75A]',
    textColor: 'text-white',
  },
  {
    provider: 'GOOGLE',
    label: 'Google 로그인',
    logo: 'G',
    bgColor: 'bg-[#EA4335]',
    textColor: 'text-white',
  },
  {
    provider: 'KAKAO',
    label: '카카오 로그인',
    logo: '💬',
    bgColor: 'bg-[#FEE500]',
    textColor: 'text-[#191919]',
  },
];

export function OAuthButtons({ role, storeId }: OAuthButtonsProps) {
  const handleClick = (provider: OAuthProviderType) => {
    saveOAuthState({ provider, role, storeId });
    window.location.href = buildOAuthUrl(provider);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {PROVIDERS.map(({ provider, label, logo, bgColor, textColor }) => (
        <button
          key={provider}
          onClick={() => handleClick(provider)}
          className={`relative flex items-center w-full h-12 rounded-lg font-medium text-sm transition-opacity hover:opacity-90 active:opacity-80 ${bgColor} ${textColor}`}
        >
          <span className="flex items-center justify-center w-12 h-12 text-lg font-bold">
            {logo}
          </span>
          <span className="flex-1 text-center pr-12">{label}</span>
        </button>
      ))}
    </div>
  );
}
