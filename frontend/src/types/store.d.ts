declare module 'store-types' {
  export interface StampCardInfo {
    stampCardId: number;
    name: string;
    reward: string;
    stampBenefit: string;
    imageUrl: string | null;
  }

  export interface StoreStampCardSummaryResponse {
    storeName: string;
    stampCard: StampCardInfo | null;
  }
}
