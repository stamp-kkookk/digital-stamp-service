/**
 * StampCardCarousel
 * 스탬프 카드 미리보기를 보여주는 단일 레이어 캐러셀
 */

import { CarouselLayer } from "./CarouselLayer";

export function StampCardCarousel() {
  // 카드 데이터 (foreground + background 1:1 매핑)
  const cardsData = [
    {
      foregroundImage: "/mock/mock-foreground1.png",
      backgroundImage: "/mock/mock-background1.png",
      storeName: "스타벅스 강남점",
      stampCount: 8,
      expiryDays: 12,
    },
    {
      foregroundImage: "/mock/mock-foreground2.png",
      backgroundImage: "/mock/mock-background2.png",
      storeName: "왕카페 교대1호점",
      stampCount: 5,
      expiryDays: 20,
    },
    {
      foregroundImage: "/mock/mock-foreground3.png",
      backgroundImage: "/mock/mock-background3.png",
      storeName: "Justine 홍대점",
      stampCount: 12,
      expiryDays: 25,
    },
    {
      foregroundImage: "/mock/mock-foreground4.png",
      backgroundImage: "/mock/mock-background4.png",
      storeName: "GtaCoffee 이태원점",
      stampCount: 12,
      expiryDays: 25,
    },
    {
      foregroundImage: "/mock/mock-foreground5.png",
      backgroundImage: "/mock/mock-background5.png",
      storeName: "하늘구름 테헤란로점",
      stampCount: 6,
      expiryDays: 15,
    },
    {
      foregroundImage: "/mock/mock-foreground6.png",
      backgroundImage: "/mock/mock-background6.png",
      storeName: "Moka 성수",
      stampCount: 9,
      expiryDays: 10,
    },
    {
      foregroundImage: "/mock/mock-foreground7.png",
      backgroundImage: "/mock/mock-background7.png",
      storeName: "YellowCoffee",
      stampCount: 1,
      expiryDays: 13,
    },
    {
      foregroundImage: "/mock/mock-foreground8.png",
      backgroundImage: "/mock/mock-background8.png",
      storeName: "체리쉬 홍대점",
      stampCount: 9,
      expiryDays: 16,
    },
  ];

  return <CarouselLayer cards={cardsData} direction="right" />;
}
