/**
 * StampCardCarousel 컴포넌트
 * 스탬프 카드용 가로 스크롤 캐러셀
 */

import { cn } from "@/lib/utils";
import type { StampCard } from "@/types/domain";
import { useCallback, useRef, useState } from "react";
import { StampCardItem } from "./StampCardItem";

interface StampCardCarouselProps {
  cards: StampCard[];
  onCardSelect: (card: StampCard) => void;
  onCardChange?: (card: StampCard) => void;
  className?: string;
}

export function StampCardCarousel({
  cards,
  onCardSelect,
  onCardChange,
  className,
}: StampCardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      const scrollLeft = target.scrollLeft;
      const width = target.offsetWidth;
      const cardWidth = width * 0.85;
      const index = Math.min(Math.max(Math.round(scrollLeft / cardWidth), 0), cards.length - 1);
      if (index !== currentIndex) {
        setCurrentIndex(index);
        onCardChange?.(cards[index]);
      }
    },
    [cards, currentIndex, onCardChange],
  );

  return (
    <div className={cn("flex flex-col", className)}>
      {/* 캐러셀 */}
      {cards.length === 1 ? (
        <div className="flex justify-center px-6 py-6">
          <div className="w-[85%] max-w-sm">
            <StampCardItem
              card={cards[0]}
              isActive
              onClick={() => onCardSelect(cards[0])}
            />
          </div>
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory px-[7.5%] gap-4 no-scrollbar items-center py-6"
            onScroll={handleScroll}
          >
            {cards.map((card, index) => (
              <div
                key={card.id}
                className="snap-center shrink-0 w-[85%] transition-all duration-300"
                style={{
                  transform: currentIndex === index ? "scale(1)" : "scale(0.95)",
                  opacity: currentIndex === index ? 1 : 0.7,
                }}
              >
                <StampCardItem
                  card={card}
                  isActive={currentIndex === index}
                  onClick={() => onCardSelect(card)}
                />
              </div>
            ))}
          </div>

          {/* 페이지네이션 점 */}
          <div className="flex justify-center gap-2 mt-6">
            {cards.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === currentIndex
                    ? "bg-kkookk-orange-500 w-4"
                    : "bg-slate-300 w-1.5",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default StampCardCarousel;
