import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing token" },
        { status: 400 }
      );
    }
    const inviteArr = (await prisma.$queryRaw<any[]>`
      SELECT id, email, token, role, "expiresAt", "acceptedAt"
      FROM "AdminInvite" WHERE token = ${token} LIMIT 1
    `) as any[];
    const invite = inviteArr?.[0];
    if (!invite) {
      return NextResponse.json(
        { success: false, error: "Invalid invite" },
        { status: 404 }
      );
    }
    if (invite.acceptedAt) {
      return NextResponse.json(
        { success: false, error: "Invite already used" },
        { status: 409 }
      );
    }
    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "Invite expired" },
        { status: 410 }
      );
    }
    return NextResponse.json({ success: true, data: { email: invite.email } });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Failed to verify invite" },
      { status: 500 }
    );
  }
}
