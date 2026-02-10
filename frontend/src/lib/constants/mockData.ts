/**
 * KKOOKK 개발용 목 데이터 상수
 * 프로덕션에서는 API 호출로 대체됨
 */

import type {
  AdminStampCard,
  IssuanceRequest,
  MigrationRequest,
  Reward,
  StampCard,
  Store,
  StoreStats,
} from "@/types/domain";

// =============================================================================
// 초기 스탬프 카드
// =============================================================================

export const INITIAL_STAMP_CARD: StampCard = {
  id: "card_001",
  storeName: "블루보틀 성수",
  current: 3,
  max: 10,
  reward: "아메리카노 1잔",
  theme: "orange",
  status: "active",
};

// =============================================================================
// 고객 지갑용 목 카드
// =============================================================================

export const MOCK_OTHER_CARDS: StampCard[] = [
  {
    id: "card_mock_1",
    storeName: "스타벅스 역삼",
    current: 8,
    max: 12,
    reward: "Tall 사이즈 음료",
    theme: "green",
    status: "active",
    bgGradient: "from-[#006241] to-[#1e3932]",
    shadowColor: "shadow-green-900/20",
  },
  {
    id: "card_mock_2",
    storeName: "메가커피 강남",
    current: 2,
    max: 10,
    reward: "아메리카노 1잔",
    theme: "yellow",
    status: "active",
    bgGradient: "from-[#fbbf24] to-[#d97706]",
    shadowColor: "shadow-yellow-500/20",
  },
];

// =============================================================================
// 목 리워드
// =============================================================================

export const MOCK_REWARDS: Reward[] = [
  {
    id: "reward_001",
    storeName: "블루보틀 성수",
    stampCardTitle: "블루보틀 스탬프 카드",
    name: "아메리카노 1잔",
    expiry: "2023.12.31",
    isUsed: false,
    designJson: null,
  },
  {
    id: "reward_002",
    storeName: "스타벅스 역삼",
    stampCardTitle: "스타벅스 스탬프 카드",
    name: "1,000원 할인",
    expiry: "2023.10.01",
    isUsed: true,
    designJson: null,
  },
];

// =============================================================================
// 목 적립 요청
// =============================================================================

export const MOCK_REQUESTS: IssuanceRequest[] = [
  {
    id: "req_101",
    type: "stamp",
    user: "김단골",
    phone: "010-1111-2222",
    count: 2,
    time: new Date(Date.now() - 1000 * 60 * 2),
    status: "pending",
    store: "블루보틀 성수",
  },
  {
    id: "req_102",
    type: "stamp",
    user: "이카페",
    phone: "010-3333-4444",
    count: 1,
    time: new Date(Date.now() - 1000 * 60 * 15),
    status: "pending",
    store: "블루보틀 성수",
  },
  {
    id: "req_103",
    type: "stamp",
    user: "박라떼",
    phone: "010-5555-6666",
    count: 1,
    time: new Date(Date.now() - 1000 * 60 * 60),
    status: "approved",
    store: "블루보틀 성수",
  },
  {
    id: "req_108",
    type: "stamp",
    user: "김고객",
    phone: "010-1234-5678",
    count: 1,
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    status: "approved",
    store: "스타벅스 역삼",
  },
  {
    id: "req_109",
    type: "stamp",
    user: "김고객",
    phone: "010-1234-5678",
    count: 2,
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    status: "approved",
    store: "블루보틀 성수",
  },
];

// =============================================================================
// 목 마이그레이션 요청
// =============================================================================

export const MOCK_MIGRATIONS: MigrationRequest[] = [
  {
    id: "mig_001",
    storeName: "블루보틀 성수",
    count: 5,
    status: "pending",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2시간 전
  },
  {
    id: "mig_002",
    storeName: "스타벅스 역삼",
    count: 8,
    status: "approved",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3일 전
  },
  {
    id: "mig_003",
    storeName: "블루보틀 성수",
    count: 12,
    status: "rejected",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1일 전
  },
];

// =============================================================================
// 목 매장 통계
// =============================================================================

export const MOCK_STATS: StoreStats = {
  totalStamps: 1240,
  totalCoupons: 128,
  usedCoupons: 96,
  weeklyData: [
    { day: "월", value: 45 },
    { day: "화", value: 52 },
    { day: "수", value: 38 },
    { day: "목", value: 65 },
    { day: "금", value: 84 },
    { day: "토", value: 120 },
    { day: "일", value: 95 },
  ],
  retentionRate: 68,
  newCustomers: 15,
};

// =============================================================================
// 목 매장 (사장님 백오피스)
// =============================================================================

export const MOCK_STORES: Store[] = [
  {
    id: 1,
    name: "블루보틀 성수",
    address: "서울 성동구 아차산로 7",
    status: "OPEN",
    activeCards: 1,
  },
  {
    id: 2,
    name: "스타벅스 역삼",
    address: "서울 강남구 테헤란로 211",
    status: "CLOSED",
    activeCards: 0,
  },
];

// =============================================================================
// 목 관리자 카드 (매장 상세용)
// =============================================================================

export const MOCK_ADMIN_CARDS: AdminStampCard[] = [
  {
    id: 2,
    name: "겨울 시즌 한정",
    status: "draft",
    benefit: "5개 적립 시 시즌 음료 1잔",
    created: "2023.10.25",
  },
  {
    id: 3,
    name: "VIP 전용 카드",
    status: "inactive",
    benefit: "20개 적립 시 MD 상품 증정",
    created: "2023.09.15",
  },
];

// =============================================================================
// 매장 카테고리
// =============================================================================

export const STORE_CATEGORIES = [
  "카페/베이커리",
  "음식점",
  "뷰티/미용",
  "학원/교육",
  "기타",
] as const;

export type StoreCategory = (typeof STORE_CATEGORIES)[number];
