export interface TerminalLoginRequest {
  email: string;
  password_hash: string; // Assuming password will be hashed on frontend or backend expects hash
}

export interface TerminalLoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface OwnerStore {
  storeId: string;
  storeName: string;
}

export interface PendingIssuanceRequest {
  requestId: string;
  customerNickname: string;
  customerPhoneNumber: string;
  requestedAt: string;
  expiresAt: string;
  status: 'PENDING';
}

export interface PendingIssuancesResponse {
  content: PendingIssuanceRequest[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
}

export interface DashboardKpi {
  pendingCount: number;
  approvedToday: number;
  rejectedToday: number;
  customerCount: number;
}
