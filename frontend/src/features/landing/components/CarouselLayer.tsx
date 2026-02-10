/**
 * CarouselLayer
 * 단일 캐러셀 레이어 (드래그 가능)
 */

import { useEffect, useRef, useState } from "react";
import { StampCardPreview, type StampCardPreviewProps } from "./StampCardPreview";

export interface CarouselLayerProps {
  cards: Array<StampCardPreviewProps>;
  direction: "left" | "right";
}

export function CarouselLayer({ cards, direction }: CarouselLayerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [cardWidth, setCardWidth] = useState(396); // 기본값
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // 초기 offset을 totalWidth로 설정 (중간 세트에서 시작하여 양방향 스크롤 가능)
  const initialOffset = cardWidth * cards.length;
  const [offset, setOffset] = useState(initialOffset);

  // 페이드인 애니메이션
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // 동적 카드 크기 계산
  useEffect(() => {
    const updateCardWidth = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const newWidth = rect.width + 16; // card width + gap
        setCardWidth(newWidth);
        // 카드 크기가 변경되면 offset도 조정 (중간 세트 위치 유지)
        const newOffset = newWidth * cards.length;
        setOffset(newOffset);
        setIsReady(true); // 측정 완료
      }
    };

    // DOM 렌더링 완료 후 측정 (깜빡임 방지)
    const timer = setTimeout(updateCardWidth, 100);

    window.addEventListener("resize", updateCardWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateCardWidth);
    };
  }, [cards.length]);

  // 자동 스크롤 + 무한 루프
  useEffect(() => {
    if (isDragging) return;

    const totalWidth = cardWidth * cards.length;
    const speed = window.innerWidth < 768 ? 0.3 : 0.5; // 모바일에서 느리게

    const interval = setInterval(() => {
      setOffset((prev) => {
        const newOffset = direction === "right" ? prev + speed : prev - speed;

        // 무한 루프: 부드러운 리셋 (깜빡임 방지)
        // 초기 offset = totalWidth (중간 세트)에서 시작
        // 오른쪽: totalWidth → 2*totalWidth, 넘으면 totalWidth로 리셋
        // 왼쪽: totalWidth → 0, 넘으면 totalWidth로 리셋
        if (newOffset >= totalWidth * 2 || newOffset <= 0) {
          // 리셋 시 transition 제거 (깜빡임 방지)
          setIsResetting(true);
          // 더블 RAF: 리셋이 완전히 적용된 후 transition 재활성화
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setIsResetting(false));
          });
          return totalWidth;
        }

        return newOffset;
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [direction, isDragging, cards.length, cardWidth]);

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(offset);
  };

  // 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // 드래그 방향대로 스크롤: 오른쪽 드래그 → 오른쪽 컨텐츠 보기
    setOffset(scrollLeft + walk);
  };

  // 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // 터치 이벤트 (모바일)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setTouchStartX(e.touches[0].clientX);
    setScrollLeft(offset);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const x = e.touches[0].clientX;
    const walk = (touchStartX - x) * 1.5; // 터치 감도
    setOffset(scrollLeft + walk);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 키보드 지원
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setOffset((prev) => prev - 50);
    } else if (e.key === "ArrowRight") {
      setOffset((prev) => prev + 50);
    }
  };

  // 무한 스크롤을 위한 카드 복제
  const infiniteCards = [...cards, ...cards, ...cards];

  // mounted와 isReady 둘 다 true일 때만 표시 (깜빡임 방지)
  const shouldShow = mounted && isReady;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-grab active:cursor-grabbing transition-opacity duration-700 touch-pan-x ${
        shouldShow ? "opacity-100" : "opacity-0"
      }`}
      style={{ transitionDelay: shouldShow ? "400ms" : "0ms" }}
      role="region"
      aria-label="스탬프 카드 캐러셀"
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
    >
      <div
        className="flex gap-2 py-4"
        style={{
          transform: `translate3d(${-offset}px, 0, 0)`,
          transition: isDragging || isResetting ? "none" : "transform 0.1s linear",
          willChange: "transform",
        }}
      >
        {infiniteCards.map((card, index) => (
          <div
            key={index}
            className="shrink-0"
            data-card
            ref={index === 0 ? cardRef : undefined}
          >
            <StampCardPreview
              foregroundImage={card.foregroundImage}
              backgroundImage={card.backgroundImage}
              storeName={card.storeName}
              stampCount={card.stampCount}
              expiryDays={card.expiryDays}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
