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
      storeName: "HAZE",
      stampCount: 8,
      expiryDays: 12,
    },
    {
      foregroundImage: "/mock/mock-foreground2.svg",
      backgroundImage: "/mock/mock-background2.svg",
      storeName: "소요 SOYO",
      stampCount: 5,
      expiryDays: 20,
    },
    {
      foregroundImage: "/mock/mock-foreground3.svg",
      backgroundImage: "/mock/mock-background3.svg",
      storeName: "구활자인쇄소",
      stampCount: 7,
      expiryDays: 25,
    },
    {
      foregroundImage: "/mock/mock-foreground4.svg",
      backgroundImage: "/mock/mock-background4.svg",
      storeName: "다방 칠팔",
      stampCount: 10,
      expiryDays: 30,
    },
    {
      foregroundImage: "/mock/mock-foreground5.svg",
      backgroundImage: "/mock/mock-background5.svg",
      storeName: "PUFF!",
      stampCount: 6,
      expiryDays: 15,
    },
    {
      foregroundImage: "/mock/mock-foreground6.svg",
      backgroundImage: "/mock/mock-background6.svg",
      storeName: "TANG!",
      stampCount: 3,
      expiryDays: 10,
    },
    {
      foregroundImage: "/mock/mock-foreground7.svg",
      backgroundImage: "/mock/mock-background7.svg",
      storeName: "NOIR",
      stampCount: 9,
      expiryDays: 20,
    },
    {
      foregroundImage: "/mock/mock-foreground8.svg",
      backgroundImage: "/mock/mock-background8.svg",
      storeName: "밤의 서재",
      stampCount: 4,
      expiryDays: 16,
    },
  ];

  return <CarouselLayer cards={cardsData} direction="right" />;
}
