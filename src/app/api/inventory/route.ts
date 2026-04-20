import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllInventoryItems } from "@/services/inventory";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const data = await getAllInventoryItems();
  return NextResponse.json({ success: true, data });
}
