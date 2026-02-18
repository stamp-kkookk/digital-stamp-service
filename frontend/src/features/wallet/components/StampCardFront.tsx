/**
 * StampCardFront 컴포넌트
 * 카드 앞면 - 순수 비주얼만 (배경 그라데이션 또는 이미지)
 * 텍스트/정보 없음, 3D 플립의 앞면
 * backfaceVisibility는 부모(캐러셀)에서 처리
 */

import { cn } from "@/lib/utils";
import type { StampCard } from "@/types/domain";

interface StampCardFrontProps {
  card: StampCard;
  className?: string;
}

export function StampCardFront({ card, className }: StampCardFrontProps) {
  const hasBackgroundImage = !!card.backgroundImage;
  const bgGradient =
    card.bgGradient || "from-[var(--color-kkookk-orange-500)] to-[#E04F00]";

  return (
    <div
      className={cn(
        "w-full aspect-[1.58/1] rounded-2xl overflow-hidden relative",
        "select-none",
        !hasBackgroundImage && "bg-linear-to-br",
        !hasBackgroundImage && bgGradient,
        className,
      )}
      style={
        hasBackgroundImage
          ? {
              backgroundImage: `url(${card.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {/* 이미지형 글래스 오버레이 */}
      {hasBackgroundImage && <div className="absolute inset-0 bg-black/10" />}

      {/* COLOR 타입 장식 요소 */}
      {!hasBackgroundImage && (
        <>
          {/* 상단 대각선 라이트 */}
          <div
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-[0.08]"
            style={{
              background: "radial-gradient(circle, white 0%, transparent 70%)",
            }}
          />

          {/* KKOOKK 텍스트 로고 - 왼쪽 상단 */}
          <img
            src="/logo/logo_text_customer.png"
            alt=""
            aria-hidden="true"
            className="absolute -left-4 -top-22 opacity-[0.07] w-68 h-68 object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />

          {/* 고양이 장식 아이콘 */}
          <img
            src="/image/cat_pace.png"
            alt=""
            aria-hidden="true"
            className="absolute -right-8 -bottom-8 opacity-[0.07] w-52 h-52 object-cover -rotate-12"
          />

          {/* 하단 그라데이션 깊이감 */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/8 to-transparent" />
        </>
      )}

      {/* 미세한 노이즈 텍스처 오버레이 */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 인너 보더 하이라이트 */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/15 pointer-events-none" />
    </div>
  );
}

export default StampCardFront;
