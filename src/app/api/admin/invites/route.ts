import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/sessions";

function generateToken(): string {
  const rand = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(rand, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sendInviteEmail(toEmail: string, acceptUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.INVITE_FROM_EMAIL || "no-reply@diffed.gg";
  if (!apiKey) {
    console.warn(
      "RESEND_API_KEY not set; skipping email send. Accept URL:",
      acceptUrl
    );
    return { sent: false };
  }
  const subject = "You're invited to join Diffed.gg as Admin";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Admin Invitation</h2>
      <p>You have been invited to join Diffed.gg as an admin.</p>
      <p>Please click the button below to accept the invite and create your admin account:</p>
      <p>
        <a href="${acceptUrl}"
           style="display:inline-block;background:#6d28d9;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">
           Accept Invite
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p><a href="${acceptUrl}">${acceptUrl}</a></p>
      <p>This link will expire soon. If you did not expect this email, you can ignore it.</p>
    </div>
  `;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: fromEmail, to: [toEmail], subject, html }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    console.error("Failed to send invite email:", res.status, msg);
    return { sent: false };
  }
  return { sent: true };
}

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
      LIMIT 50
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
    const sent = await sendInviteEmail(email, acceptUrl);
    return NextResponse.json({
      success: true,
      data: { ...invite, acceptUrl, emailSent: sent.sent },
    });
  } catch (e) {
    console.error("e", e);
    console.trace(e);
    return NextResponse.json(
      { success: false, error: "Failed to create invite" },
      { status: 500 }
    );
  }
}
