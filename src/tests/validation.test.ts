/**
 * Validation Schema Tests — covers all Zod schemas used in forms and API routes.
 */
import { describe, it, expect } from "vitest";
import { loginSchema, createRequestSchema, reviewRequestSchema } from "@/lib/validations";

// ── Login Schema ──────────────────────────────────────────────────────────────
describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({ email: "admin@company.com", password: "admin123" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "abc" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Invalid email");
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "user@test.com", password: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Password is required");
  });

  it("rejects missing fields", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error?.issues.length).toBeGreaterThanOrEqual(2);
  });
});

// ── Create Request Schema ─────────────────────────────────────────────────────
describe("createRequestSchema", () => {
  it("accepts valid request with all fields", () => {
    const result = createRequestSchema.safeParse({
      inventoryItemId: "item-abc-123",
      quantity: 5,
      remarks: "For the new joiners",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(5);
      expect(result.data.remarks).toBe("For the new joiners");
    }
  });

  it("accepts request without optional remarks", () => {
    const result = createRequestSchema.safeParse({
      inventoryItemId: "item-abc-123",
      quantity: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty inventoryItemId", () => {
    const result = createRequestSchema.safeParse({ inventoryItemId: "", quantity: 2 });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Please select an item");
  });

  it("rejects quantity of zero", () => {
    const result = createRequestSchema.safeParse({
      inventoryItemId: "item-1",
      quantity: 0,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Quantity must be at least 1");
  });

  it("rejects negative quantity", () => {
    const result = createRequestSchema.safeParse({
      inventoryItemId: "item-1",
      quantity: -5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing inventoryItemId", () => {
    const result = createRequestSchema.safeParse({ quantity: 3 });
    expect(result.success).toBe(false);
  });
});

// ── Review Request Schema ─────────────────────────────────────────────────────
describe("reviewRequestSchema", () => {
  it("accepts approve action", () => {
    const result = reviewRequestSchema.safeParse({ action: "approve" });
    expect(result.success).toBe(true);
  });

  it("accepts reject action with reason", () => {
    const result = reviewRequestSchema.safeParse({
      action: "reject",
      rejectionReason: "Not in budget",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rejectionReason).toBe("Not in budget");
    }
  });

  it("accepts reject action without reason (optional)", () => {
    const result = reviewRequestSchema.safeParse({ action: "reject" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid action value", () => {
    const result = reviewRequestSchema.safeParse({ action: "delete" });
    expect(result.success).toBe(false);
  });

  it("rejects missing action", () => {
    const result = reviewRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
