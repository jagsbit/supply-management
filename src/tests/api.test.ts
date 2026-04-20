/**
 * API / Service Layer Tests
 * Tests business logic in src/services/ with a mocked Prisma client.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock Prisma ──────────────────────────────────────────────────────────────
const mockPrisma = vi.hoisted(() => ({
  supplyRequest: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
  inventoryItem: {
    findMany: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

import { getAllInventoryItems } from "@/services/inventory";
import {
  getAllRequests,
  getRequestsByUser,
  createRequest,
  approveRequest,
  rejectRequest,
} from "@/services/requests";

// ── Fixtures ─────────────────────────────────────────────────────────────────
const mockItem = {
  id: "item-1",
  name: "Ballpoint Pens",
  description: "Blue ink",
  quantity: 50,
  unit: "packs",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUser = { id: "user-1", name: "John Employee", email: "employee@company.com" };
const mockAdmin = { id: "admin-1", name: "Admin User", email: "admin@company.com" };

const mockRequest = {
  id: "req-1",
  quantity: 3,
  remarks: "For desk use",
  status: "PENDING",
  rejectionReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  requester: mockUser,
  inventoryItem: { id: "item-1", name: "Ballpoint Pens", unit: "packs" },
  reviewedBy: null,
};

// ── Inventory Service Tests ───────────────────────────────────────────────────
describe("Inventory Service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all inventory items sorted by name", async () => {
    mockPrisma.inventoryItem.findMany.mockResolvedValue([mockItem]);
    const result = await getAllInventoryItems();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "item-1",
      name: "Ballpoint Pens",
      quantity: 50,
      unit: "packs",
    });
    expect(mockPrisma.inventoryItem.findMany).toHaveBeenCalledWith({
      orderBy: { name: "asc" },
    });
  });

  it("returns empty array when no inventory exists", async () => {
    mockPrisma.inventoryItem.findMany.mockResolvedValue([]);
    const result = await getAllInventoryItems();
    expect(result).toEqual([]);
  });
});

// ── Request Service — Read Tests ──────────────────────────────────────────────
describe("Request Service — Read", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getAllRequests returns all requests ordered by createdAt desc", async () => {
    mockPrisma.supplyRequest.findMany.mockResolvedValue([mockRequest]);
    const result = await getAllRequests();
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("PENDING");
    expect(mockPrisma.supplyRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: "desc" } })
    );
  });

  it("getRequestsByUser filters by requesterId", async () => {
    mockPrisma.supplyRequest.findMany.mockResolvedValue([mockRequest]);
    const result = await getRequestsByUser("user-1");
    expect(result).toHaveLength(1);
    expect(mockPrisma.supplyRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { requesterId: "user-1" } })
    );
  });

  it("getRequestsByUser returns empty array when user has no requests", async () => {
    mockPrisma.supplyRequest.findMany.mockResolvedValue([]);
    const result = await getRequestsByUser("unknown-user");
    expect(result).toEqual([]);
  });
});

// ── Request Service — Create Tests ────────────────────────────────────────────
describe("Request Service — Create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a request and returns formatted data", async () => {
    mockPrisma.supplyRequest.create.mockResolvedValue(mockRequest);
    const result = await createRequest("user-1", {
      inventoryItemId: "item-1",
      quantity: 3,
      remarks: "For desk use",
    });
    expect(result.id).toBe("req-1");
    expect(result.status).toBe("PENDING");
    expect(result.createdAt).toBeTypeOf("string"); // formatted to ISO string
  });

  it("sets remarks to null when not provided", async () => {
    mockPrisma.supplyRequest.create.mockResolvedValue({ ...mockRequest, remarks: null });
    await createRequest("user-1", { inventoryItemId: "item-1", quantity: 2 });
    expect(mockPrisma.supplyRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ remarks: null }),
      })
    );
  });
});

// ── Request Service — Approve Tests ───────────────────────────────────────────
describe("Request Service — Approve", () => {
  beforeEach(() => vi.clearAllMocks());

  it("approves a PENDING request and deducts inventory in a transaction", async () => {
    mockPrisma.supplyRequest.findUnique.mockResolvedValue({
      ...mockRequest,
      inventoryItem: { ...mockItem, quantity: 50 },
    });
    mockPrisma.$transaction.mockResolvedValue([]);
    const result = await approveRequest("req-1", "admin-1");
    expect(result.success).toBe(true);
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("rejects approval when request is not found", async () => {
    mockPrisma.supplyRequest.findUnique.mockResolvedValue(null);
    const result = await approveRequest("nonexistent", "admin-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Request not found");
  });

  it("rejects approval when request is already reviewed", async () => {
    mockPrisma.supplyRequest.findUnique.mockResolvedValue({
      ...mockRequest,
      status: "APPROVED",
      inventoryItem: mockItem,
    });
    const result = await approveRequest("req-1", "admin-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Request already reviewed");
  });

  it("rejects approval when stock is insufficient", async () => {
    mockPrisma.supplyRequest.findUnique.mockResolvedValue({
      ...mockRequest,
      quantity: 100,
      inventoryItem: { ...mockItem, quantity: 5 },
    });
    const result = await approveRequest("req-1", "admin-1");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Insufficient stock");
    expect(result.error).toContain("5");
  });

  it("does NOT call $transaction when stock is insufficient", async () => {
    mockPrisma.supplyRequest.findUnique.mockResolvedValue({
      ...mockRequest,
      quantity: 999,
      inventoryItem: { ...mockItem, quantity: 1 },
    });
    await approveRequest("req-1", "admin-1");
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});

// ── Request Service — Reject Tests ────────────────────────────────────────────
describe("Request Service — Reject", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a PENDING request with an optional reason", async () => {
    mockPrisma.supplyRequest.findUnique.mockResolvedValue(mockRequest);
    mockPrisma.supplyRequest.update.mockResolvedValue({});
    const result = await rejectRequest("req-1", "admin-1", "Budget exceeded");
    expect(result.success).toBe(true);
    expect(mockPrisma.supplyRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "REJECTED",
          reviewedById: "admin-1",
          rejectionReason: "Budget exceeded",
        }),
      })
    );
  });

  it("rejects without a reason (null stored)", async () => {
    mockPrisma.supplyRequest.findUnique.mockResolvedValue(mockRequest);
    mockPrisma.supplyRequest.update.mockResolvedValue({});
    const result = await rejectRequest("req-1", "admin-1");
    expect(result.success).toBe(true);
    expect(mockPrisma.supplyRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ rejectionReason: null }),
      })
    );
  });

  it("returns error when request is not found", async () => {
    mockPrisma.supplyRequest.findUnique.mockResolvedValue(null);
    const result = await rejectRequest("nonexistent", "admin-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Request not found");
  });

  it("returns error when request is already reviewed", async () => {
    mockPrisma.supplyRequest.findUnique.mockResolvedValue({
      ...mockRequest,
      status: "REJECTED",
    });
    const result = await rejectRequest("req-1", "admin-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Request already reviewed");
  });
});
