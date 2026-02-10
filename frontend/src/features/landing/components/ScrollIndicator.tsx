/**
 * ScrollIndicator
 * 랜딩 페이지 섹션 네비게이션을 위한 플로팅 인디케이터
 * 화면 오른쪽에 고정되어 현재 스크롤 위치를 시각적으로 표시
 */

import { useEffect, useState } from "react";

const SECTIONS = [
  "hero",
  "problem",
  "solving",
  "guarantee",
  "review",
  "faq",
] as const;

export function ScrollIndicator() {
  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    // 스크롤 컨테이너 찾기 (main 요소)
    const scrollContainer = document.querySelector("main");
    if (!scrollContainer) return;

    // 각 섹션의 가시성을 추적
    const sectionVisibility = new Map<string, number>();

    const updateActiveSection = () => {
      let maxVisibility = 0;
      let mostVisibleSection = "hero";

      sectionVisibility.forEach((visibility, sectionId) => {
        if (visibility > maxVisibility) {
          maxVisibility = visibility;
          mostVisibleSection = sectionId;
        }
      });

      if (maxVisibility > 0) {
        setActiveSection(mostVisibleSection);
      }
    };

    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // 각 섹션의 가시성 비율을 저장
            sectionVisibility.set(sectionId, entry.intersectionRatio);
            updateActiveSection();
          });
        },
        {
          root: scrollContainer, // 스크롤 컨테이너를 root로 설정
          threshold: Array.from({ length: 101 }, (_, i) => i * 0.01), // 0, 0.01, 0.02, ... 1.0
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const handleClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <nav
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3"
      aria-label="페이지 섹션 네비게이션"
    >
      {SECTIONS.map((sectionId) => {
        const isActive = activeSection === sectionId;

        return (
          <button
            key={sectionId}
            onClick={() => handleClick(sectionId)}
            className="group"
            aria-label={`${sectionId} 섹션으로 이동`}
            aria-current={isActive ? "true" : undefined}
          >
            {/* 인디케이터 점 */}
            <span
              className={`
                block w-2.5 h-2.5 rounded-full transition-colors duration-300
                ${isActive ? "bg-kkookk-orange-500" : "bg-gray-300"}
              `}
            />
          </button>
        );
      })}
    </nav>
  );
}
