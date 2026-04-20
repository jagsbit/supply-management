import { prisma } from "@/lib/db";
import { SupplyRequestData } from "@/types";
import { CreateRequestInput } from "@/lib/validations";

function formatRequest(req: {
  id: string;
  quantity: number;
  remarks: string | null;
  status: string;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  requester: { id: string; name: string; email: string };
  inventoryItem: { id: string; name: string; unit: string };
  reviewedBy: { id: string; name: string } | null;
}): SupplyRequestData {
  return {
    ...req,
    status: req.status as SupplyRequestData["status"],
    createdAt: req.createdAt.toISOString(),
    updatedAt: req.updatedAt.toISOString(),
  };
}

const requestInclude = {
  requester: { select: { id: true, name: true, email: true } },
  inventoryItem: { select: { id: true, name: true, unit: true } },
  reviewedBy: { select: { id: true, name: true } },
};

export async function getAllRequests(): Promise<SupplyRequestData[]> {
  const requests = await prisma.supplyRequest.findMany({
    include: requestInclude,
    orderBy: { createdAt: "desc" },
  });
  return requests.map(formatRequest);
}

export async function getRequestsByUser(userId: string): Promise<SupplyRequestData[]> {
  const requests = await prisma.supplyRequest.findMany({
    where: { requesterId: userId },
    include: requestInclude,
    orderBy: { createdAt: "desc" },
  });
  return requests.map(formatRequest);
}

export async function createRequest(
  userId: string,
  data: CreateRequestInput
): Promise<SupplyRequestData> {
  const request = await prisma.supplyRequest.create({
    data: {
      requesterId: userId,
      inventoryItemId: data.inventoryItemId,
      quantity: data.quantity,
      remarks: data.remarks || null,
    },
    include: requestInclude,
  });
  return formatRequest(request);
}

export async function approveRequest(
  requestId: string,
  reviewerId: string
): Promise<{ success: boolean; error?: string }> {
  const request = await prisma.supplyRequest.findUnique({
    where: { id: requestId },
    include: { inventoryItem: true },
  });

  if (!request) return { success: false, error: "Request not found" };
  if (request.status !== "PENDING") return { success: false, error: "Request already reviewed" };
  if (request.inventoryItem.quantity < request.quantity) {
    return { success: false, error: `Insufficient stock. Available: ${request.inventoryItem.quantity} ${request.inventoryItem.unit}` };
  }

  await prisma.$transaction([
    prisma.supplyRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED", reviewedById: reviewerId },
    }),
    prisma.inventoryItem.update({
      where: { id: request.inventoryItemId },
      data: { quantity: { decrement: request.quantity } },
    }),
  ]);

  return { success: true };
}

export async function rejectRequest(
  requestId: string,
  reviewerId: string,
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> {
  const request = await prisma.supplyRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) return { success: false, error: "Request not found" };
  if (request.status !== "PENDING") return { success: false, error: "Request already reviewed" };

  await prisma.supplyRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      reviewedById: reviewerId,
      rejectionReason: rejectionReason || null,
    },
  });

  return { success: true };
}
