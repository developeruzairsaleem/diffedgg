"use server";
import { LoginFormSchema, SignupFormSchema } from "@/lib/definitions";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/sessions";
import { createWallet, getWallet } from "@/lib/wallet";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function signup(state: any, formData: FormData) {
  try {
    console.log("formData", formData);
    // Validate form fields
    const validatedFields = SignupFormSchema.safeParse({
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
    });

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
      return {
        //   errors: validatedFields.error.flatten().fieldErrors,
        errors: {
          message: "Invalid registration data, please make sure it is valid",
        },
      };
    }

    // prepare the user data for db insertion
    const { username, email, password, role } = validatedFields.data;
    // check for existing emails and usernames
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    //if user already exist return error
    if (existingUser) {
      //  if email matches
      if (existingUser.email === email) {
        return {
          errors: {
            message: "Email already exists",
          },
        };
      }
      // if username matches
      if (existingUser.username === username) {
        return {
          errors: {
            message: "Username already exists",
          },
        };
      }
    }
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Admin invite token support
    const inviteToken = String(formData.get("inviteToken") || "").trim();
    if (inviteToken) {
      const inviteArr = (await prisma.$queryRaw<any[]>`
        SELECT id, email, token, role, "expiresAt", "acceptedAt"
        FROM "AdminInvite" WHERE token = ${inviteToken} LIMIT 1
      `) as any[];
      const invite = inviteArr?.[0];
      if (!invite) {
        return { errors: { message: "Invalid or expired invite token" } };
      }
      if (invite.acceptedAt) {
        return { errors: { message: "Invite already used" } };
      }
      if (invite.expiresAt < new Date()) {
        return { errors: { message: "Invite has expired" } };
      }
      if (invite.email.toLowerCase() !== email.toLowerCase()) {
        return { errors: { message: "Invite email does not match" } };
      }
    }

    // 3. Insert the user into the database
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: inviteToken ? ("admin" as any) : role,
        status: role === "provider" ? "inactive" : "active",
      },
    });
    // something went wrong while creating a user
    if (!user) {
      return {
        errors: {
          message: "An error occurred while creating your account.",
        },
      };
    }

    // create user wallet entry in the database
    const wallet = await createWallet(user.id);

    // mark invite accepted if used
    if (inviteToken) {
      await prisma.$executeRawUnsafe(
        `UPDATE "AdminInvite" SET "acceptedAt" = now() WHERE token = $1`,
        inviteToken
      );
    }
    // create the session
    await createSession(user.id, user.role);
    return { user };
  } catch (error) {
    return {
      errors: {
        message: "Something went wrong registering",
        // message: error instanceof Error ? error.message : "An unknown error occurred",
      },
    };
  }
}

// Accept admin invite: create or update admin account, invalidate token, and start session
export async function acceptAdminInvite(state: any, formData: FormData) {
  try {
    const username = String(formData.get("username") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const inviteToken = String(formData.get("inviteToken") || "").trim();

    // Basic server-side validation
    if (!username || !/^[a-zA-Z0-9_]{3,}$/.test(username)) {
      return { errors: { message: "Invalid username format" } };
    }
    if (
      !password ||
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)
    ) {
      return { errors: { message: "Password too weak" } };
    }
    if (!inviteToken) {
      return { errors: { message: "Missing invite token" } };
    }

    // Validate invite
    const invites = (await prisma.$queryRaw<any[]>`
      SELECT id, email, token, role, "expiresAt", "acceptedAt"
      FROM "AdminInvite" WHERE token = ${inviteToken} LIMIT 1
    `) as any[];
    const invite = invites?.[0];
    if (!invite) {
      return { errors: { message: "Invalid or expired invite token" } };
    }
    if (invite.acceptedAt) {
      return { errors: { message: "Invite already used" } };
    }
    if (invite.expiresAt < new Date()) {
      return { errors: { message: "Invite has expired" } };
    }
    if (invite.email.toLowerCase() !== email.toLowerCase()) {
      return { errors: { message: "Invite email does not match" } };
    }

    // Check if user exists by email
    const existingUser = await prisma.user.findUnique({ where: { email } });

    // Ensure username unique (if different from existing user's)
    const usernameOwner = await prisma.user.findFirst({ where: { username } });
    if (
      usernameOwner &&
      (!existingUser || usernameOwner.id !== existingUser.id)
    ) {
      return { errors: { message: "Username already exists" } };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let userId = "";

    if (existingUser) {
      // Update existing user with new credentials and promote to admin
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          username,
          password: hashedPassword,
          role: "admin" as any,
          status: "active" as any,
        },
      });
      userId = updated.id;
    } else {
      // Create new admin user
      const created = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: "admin" as any,
          status: "active" as any,
        },
      });
      userId = created.id;
      // Optionally create wallet to keep consistency
      await createWallet(userId);
    }

    // Mark invite as accepted (one-time use)
    await prisma.$executeRawUnsafe(
      `UPDATE "AdminInvite" SET "acceptedAt" = now() WHERE token = $1`,
      inviteToken
    );

    // Create session and redirect
    await createSession(userId, "admin");
    return { user: { id: userId, role: "admin" } };
  } catch (error) {
    return { errors: { message: "Failed to accept invite" } };
  }
}

// login action

export async function login(state: any, formData: FormData) {
  try {
    // Validate form fields
    const validatedFields = LoginFormSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
      return {
        //   errors: validatedFields.error.flatten().fieldErrors,
        errors: {
          message: "Invalid credentials.",
        },
      };
    }

    // prepare the user data for db checking
    const { email, password } = validatedFields.data;
    // check for valid Email
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    //if user already exist return error
    if (!user) {
      //  if email is not valid
      return {
        errors: {
          message: "Email does not exist",
        },
      };
    }
    // check hashed password
    const isValidPassword = await bcrypt.compare(password, user.password);

    // check if the password is valid
    if (!isValidPassword) {
      return {
        errors: {
          message: "Incorrect password",
        },
      };
    }

    // create the session
    await createSession(user.id, user.role);
    return { user };
  } catch (error) {
    console.error("something went wrong", error);
    return {
      errors: {
        message: "Something went wrong can't login",
      },
    };
  }
}

export async function logout() {
  try {
    await deleteSession();
    redirect("/login");
  } catch (error) {
    console.error("something went wrong deleting session");
    console.error(error);
  }
}
