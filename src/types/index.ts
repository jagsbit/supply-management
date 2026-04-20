import { Role, RequestStatus } from "@prisma/client";

export type { Role, RequestStatus };

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface InventoryItemData {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
}

export interface SupplyRequestData {
  id: string;
  quantity: number;
  remarks: string | null;
  status: RequestStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  requester: { id: string; name: string; email: string };
  inventoryItem: { id: string; name: string; unit: string };
  reviewedBy: { id: string; name: string } | null;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}
