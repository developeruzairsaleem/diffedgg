"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { message } from "antd";
import { useFormState } from "react-dom";
import { signup } from "@/actions/auth";

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [email, setEmail] = useState("");
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const [state, formAction] = useFormState(signup as any, null);

  useEffect(() => {
    if (state?.errors?.message) {
      message.error(state.errors.message);
    }
    if (state?.user) {
      router.push("/admin");
    }
  }, [state, router]);

  if (verifying) return <div className="text-white">Verifying invite…</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-white">
      <form
        action={formAction}
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
            className="w-full bg-black/30 border border-white/20 rounded px-3 py-2"
            required
          />
        </div>
        <input type="hidden" name="role" value="admin" />
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 rounded py-2 font-semibold"
        >
          Create Admin Account
        </button>
      </form>
    </div>
  );
}
