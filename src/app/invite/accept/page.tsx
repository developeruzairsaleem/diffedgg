"use client";
import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { message } from "antd";
import { useFormState, useFormStatus } from "react-dom";
import { acceptAdminInvite } from "@/actions/auth";

export const dynamic = "force-dynamic";

function AcceptInviteClient() {
  const router = useRouter();
  const params = useSearchParams();
  const token = (params?.get("token") as string) || "";
  const [email, setEmail] = useState("");
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(
          `/api/admin/invites/verify?token=${encodeURIComponent(token)}`
        );
        const json = await res.json();
        if (!res.ok || !json.success)
          throw new Error(json.error || "Invalid invite");
        setEmail(json.data.email);
      } catch (e: any) {
        setError(e?.message || "Invalid invite");
      } finally {
        setVerifying(false);
      }
    };
    if (token) verify();
    else {
      setError("Missing token");
      setVerifying(false);
    }
  }, [token]);

  const [state, formAction] = useFormState<any, FormData>(
    acceptAdminInvite as any,
    {} as any
  );

  useEffect(() => {
    if (state && (state as any).errors && (state as any).errors.message) {
      message.error((state as any).errors.message);
    }
    if (state && (state as any).user) {
      router.push("/admin");
    }
  }, [state, router]);

  if (verifying) return <div className="text-white">Verifying invite…</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-purple-600 hover:bg-purple-700 rounded py-2 font-semibold disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create Admin Account"}
      </button>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-white">
      <form
        action={formAction}
        ref={formRef}
        noValidate
        className="bg-black/40 border border-white/10 p-6 rounded w-full max-w-md space-y-4"
      >
        <h1 className="text-xl font-semibold">Accept Admin Invite</h1>
        <input type="hidden" name="inviteToken" value={token} />
        <div>
          <label className="block mb-1 text-sm">Email</label>
          <input
            name="email"
            value={email}
            readOnly
            className="w-full bg-black/30 border border-white/20 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm">Username</label>
          <input
            name="username"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            pattern="^[a-zA-Z0-9_]{3,}$"
            title="At least 3 characters. Letters, numbers and underscores only."
            className="w-full bg-black/30 border border-white/20 rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-sm">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            pattern="^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$"
            title="Min 8 chars, include letter, number, and special character."
            className="w-full bg-black/30 border border-white/20 rounded px-3 py-2"
            required
          />
        </div>
        <input type="hidden" name="role" value="admin" />
        <SubmitButton />
      </form>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="text-white">Loading…</div>}>
      <AcceptInviteClient />
    </Suspense>
  );
}
