import { z } from "zod";

export const ProfileSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(20, { message: "Username must be at most 20 characters long." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers and underscores",
    })
    .trim(),
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .trim(),
  bio: z
    .string()
    .min(10, { message: "Bio must be at least 10 characters long." })
    .max(500, { message: "Bio must be at most 500 characters long." })
    .trim(),
  profileImage: z
    .string()
    .url({ message: "Profile image must be a valid URL." })
    .refine(
      (url) => {
        console.log("url", url);
        const isImageUrl = url.includes("utfs");
        return isImageUrl;
      },
      {
        message: "Profile image must be a valid image URL.",
      }
    ),
});

export type ProfileFormData = z.infer<typeof ProfileSchema>;
