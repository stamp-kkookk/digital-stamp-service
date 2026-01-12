export type StampCardStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export interface StampCard {
  id: number;
  storeId: number;
  title: string;
  description?: string;
  status: StampCardStatus;
  themeColor?: string;
  stampGoal: number;
  rewardName?: string;
  rewardExpiresInDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStampCardRequest {
  storeId: number;
  title: string;
  description?: string;
  themeColor?: string;
  stampGoal: number;
  rewardName?: string;
  rewardExpiresInDays?: number;
}

export interface PublicStampCard {
  id: number;
  storeId: number;
  title: string;
  description?: string;
  themeColor?: string;
  stampGoal: number;
  rewardName?: string;
  rewardExpiresInDays?: number;
}
