import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  await prisma.supplyRequest.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@company.com",
      name: "Admin User",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const empHash = await bcrypt.hash("employee123", 10);
  const employee = await prisma.user.create({
    data: {
      email: "employee@company.com",
      name: "John Employee",
      passwordHash: empHash,
      role: "EMPLOYEE",
    },
  });

  const items = await Promise.all([
    prisma.inventoryItem.create({ data: { name: "Ballpoint Pens", description: "Blue ink, pack of 12", quantity: 50, unit: "packs" } }),
    prisma.inventoryItem.create({ data: { name: "Notebooks (A4)", description: "80-page lined notebooks", quantity: 30, unit: "pcs" } }),
    prisma.inventoryItem.create({ data: { name: "Staplers", description: "Standard desktop stapler", quantity: 10, unit: "pcs" } }),
    prisma.inventoryItem.create({ data: { name: "Printer Paper (A4)", description: "500 sheets per ream", quantity: 20, unit: "reams" } }),
    prisma.inventoryItem.create({ data: { name: "Whiteboard Markers", description: "Assorted colors, pack of 4", quantity: 15, unit: "packs" } }),
    prisma.inventoryItem.create({ data: { name: "Sticky Notes", description: "3x3 inch, pack of 100", quantity: 25, unit: "packs" } }),
  ]);

  await prisma.supplyRequest.create({
    data: {
      requesterId: employee.id,
      inventoryItemId: items[0].id,
      quantity: 2,
      remarks: "For the marketing team",
      status: "PENDING",
    },
  });

  await prisma.supplyRequest.create({
    data: {
      requesterId: employee.id,
      inventoryItemId: items[3].id,
      quantity: 5,
      remarks: "Printing quarterly reports",
      status: "APPROVED",
      reviewedById: admin.id,
    },
  });

  await prisma.supplyRequest.create({
    data: {
      requesterId: employee.id,
      inventoryItemId: items[2].id,
      quantity: 20,
      remarks: "Need for conference room",
      status: "REJECTED",
      rejectionReason: "Insufficient stock at this time",
      reviewedById: admin.id,
    },
  });

  console.log("Seed completed successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
