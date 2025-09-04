import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/sessions";
// Avoid static import to prevent build-time dependency if not installed in some envs
// We'll dynamically import nodemailer only when SMTP env is configured

function generateToken(): string {
  const rand = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(rand, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Email sending intentionally disabled per request; acceptUrl is returned in response for copying

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    const session = await decrypt(sessionCookie);
    if (!session?.userId || session?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const invites = (await prisma.$queryRaw<any[]>`
      SELECT id, email, token, role, "expiresAt", "acceptedAt", "createdAt", "createdById"
      FROM "AdminInvite"
      ORDER BY "createdAt" DESC
      LIMIT 10
    `) as any[];
    return NextResponse.json({ success: true, data: invites });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Failed to list invites" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    const session = await decrypt(sessionCookie);
    if (!session?.userId || session?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { email, expiresInHours = 48 } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid email" },
        { status: 400 }
      );
    }
    const token = generateToken();
    const id = crypto.randomUUID();
    const expiresAt = new Date(
      Date.now() + Number(expiresInHours) * 60 * 60 * 1000
    );
    const inviteArr = (await prisma.$queryRaw<any[]>`
      INSERT INTO "AdminInvite" (id, email, token, role, "expiresAt", "createdAt", "createdById")
      VALUES (${id}, ${email}, ${token}, 'admin', ${expiresAt}, now(), ${String(
      session.userId
    )})
      RETURNING id, email, token, role, "expiresAt", "acceptedAt", "createdAt", "createdById"
    `) as any[];
    const invite = inviteArr?.[0];
    const acceptUrl = `${
      new URL(request.url).origin
    }/invite/accept?token=${token}`;

    // Send email via nodemailer when SMTP env is configured
    const host = process.env.SMTP_HOST as string | undefined;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER as string | undefined;
    const pass = process.env.SMTP_PASS as string | undefined;
    const from = process.env.INVITE_FROM_EMAIL || "no-reply@diffed.gg";
    if (host && user && pass) {
      const nodemailerMod: any = await import("nodemailer");
      const transporter = nodemailerMod.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>Admin Invitation</h2>
          <p>You have been invited to join Diffed.gg as an admin.</p>
          <p>Click the button below to accept the invite and create your admin account:</p>
          <p>
            <a href="${acceptUrl}"
               style="display:inline-block;background:#6d28d9;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">
               Accept Invite
            </a>
          </p>
          <p>If the button doesn't work, copy and paste this link:</p>
          <p><a href="${acceptUrl}">${acceptUrl}</a></p>
        </div>`;
      await transporter.sendMail({
        from,
        to: email,
        subject: "You're invited to join Diffed.gg as Admin",
        html,
      });
    }

    return NextResponse.json({ success: true, data: { ...invite, acceptUrl } });
  } catch (e) {
    console.error("e", e);
    console.trace(e);
    return NextResponse.json(
      { success: false, error: "Failed to create invite" },
      { status: 500 }
    );
  }
}
