export interface Store {
  id: number;
  ownerId: number;
  name: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreRequest {
  name: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
}

export interface UpdateStoreRequest {
  name?: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
}
