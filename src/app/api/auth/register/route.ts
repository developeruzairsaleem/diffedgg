import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password, ...body } = await request.json();
    const existingUser = await prisma.user.findFirst({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists, log in!" },
        { status: 404 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const registeredUser = await prisma.user.create({
      data: {
        ...body,
        status: body.role === "provider" ? "inactive" : undefined,
        password: hashedPassword,
      },
    });
    return NextResponse.json("user sucessfully registered!");
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
