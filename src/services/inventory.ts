import { prisma } from "@/lib/db";
import { InventoryItemData } from "@/types";

export async function getAllInventoryItems(): Promise<InventoryItemData[]> {
  const items = await prisma.inventoryItem.findMany({
    orderBy: { name: "asc" },
  });
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
  }));
}
