/**
 * StampCardCarousel
 * 스탬프 카드 미리보기를 보여주는 단일 레이어 캐러셀
 */

import { CarouselLayer } from "./CarouselLayer";

export function StampCardCarousel() {
  // 카드 데이터 (foreground + background 1:1 매핑)
  const cardsData = [
    {
      foregroundImage: "/mock/mock-foreground1.svg",
      backgroundImage: "/mock/mock-background1.svg",
      storeName: "달빛 로스터스",
      stampCount: 8,
      expiryDays: 12,
    },
    {
      foregroundImage: "/mock/mock-foreground2.svg",
      backgroundImage: "/mock/mock-background2.svg",
      storeName: "봄날의 빵집",
      stampCount: 5,
      expiryDays: 20,
    },
    {
      foregroundImage: "/mock/mock-foreground3.svg",
      backgroundImage: "/mock/mock-background3.svg",
      storeName: "초록잎 티하우스",
      stampCount: 12,
      expiryDays: 25,
    },
    {
      foregroundImage: "/mock/mock-foreground4.svg",
      backgroundImage: "/mock/mock-background4.svg",
      storeName: "구름 디저트",
      stampCount: 12,
      expiryDays: 25,
    },
    {
      foregroundImage: "/mock/mock-foreground5.svg",
      backgroundImage: "/mock/mock-background5.svg",
      storeName: "해안선 커피",
      stampCount: 6,
      expiryDays: 15,
    },
    {
      foregroundImage: "/mock/mock-foreground6.svg",
      backgroundImage: "/mock/mock-background6.svg",
      storeName: "옛뜰 한과점",
      stampCount: 9,
      expiryDays: 10,
    },
    {
      foregroundImage: "/mock/mock-foreground7.svg",
      backgroundImage: "/mock/mock-background7.svg",
      storeName: "오렌지 팩토리",
      stampCount: 1,
      expiryDays: 13,
    },
    {
      foregroundImage: "/mock/mock-foreground8.svg",
      backgroundImage: "/mock/mock-background8.svg",
      storeName: "밤하늘 라운지",
      stampCount: 9,
      expiryDays: 16,
    },
  ];

  return <CarouselLayer cards={cardsData} direction="right" />;
}
