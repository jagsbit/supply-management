import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllRequests, getRequestsByUser, createRequest } from "@/services/requests";
import { createRequestSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as { id: string; role: string };
  const data = user.role === "ADMIN" ? await getAllRequests() : await getRequestsByUser(user.id);
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as { id: string; role: string };
  if (user.role !== "EMPLOYEE") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const coerced = { ...body, quantity: Number(body.quantity) };
  const parsed = createRequestSchema.safeParse(coerced);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
  }

  const data = await createRequest(user.id, parsed.data);
  return NextResponse.json({ success: true, data }, { status: 201 });
}
