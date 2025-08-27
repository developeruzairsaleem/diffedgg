import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import z from "zod";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/sessions";

const f = createUploadthing();

async function getUserIdFromCookies() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  return (session as any)?.userId || null;
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // this field is used to validate the frontend input prop logic
    .input(z.object({ assignmentId: z.string() }))
    // Set permissions and file types for this FileRoute
    .middleware(
      async ({
        req,
        input,
      }: {
        req: Request;
        input: { assignmentId: string };
      }) => {
        // This code runs on your server before upload
        // const user = await auth(req);
        // If you throw, the user will not be able to upload
        // if (!user) throw new UploadThingError("Unauthorized");
        if (!input.assignmentId)
          throw new UploadThingError("No assignment selected");
        // Whatever is returned here is accessible in onUploadComplete as `metadata`
        return { assignmentId: input.assignmentId };
      }
    )
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log(
        "Upload complete for following assignmentId:",
        metadata.assignmentId
      );
      console.log("file url", file.ufsUrl);
      const response = await prisma.orderAssignment.update({
        where: {
          id: metadata.assignmentId,
        },
        data: { proofUrl: file.ufsUrl, status: "COMPLETED" },
      });
      console.log("data", response);
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { assignmentId: metadata.assignmentId, success: true };
    }),
  profileImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const userId = await getUserIdFromCookies();
      if (!userId) throw new UploadThingError("Unauthorized");
      return { userId } as { userId: string };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Return the URL to the client, let the client handle the database update
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
