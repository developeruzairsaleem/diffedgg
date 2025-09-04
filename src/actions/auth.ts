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

    // 3. Insert the user into the database
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
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
