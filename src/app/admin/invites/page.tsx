"use client";
import { useEffect, useState } from "react";
import { message } from "antd";

interface Invite {
  id: string;
  email: string;
  token: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
}

export default function AdminInvitesPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/invites");
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.error || "Failed to load invites");
      setInvites(json.data || []);
    } catch (e: any) {
      message.error(e?.message || "Failed to load invites");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createInvite = async () => {
    setError(null);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.error || "Failed to create invite");
      message.success("Invite created. Copy the link below.");
      setEmail("");
      load();
    } catch (e: any) {
      message.error(e?.message || "Failed to create invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Admin Invites</h1>
      <div className="flex gap-2 mb-6">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded px-3 py-2 w-80"
        />
        {error && (
          <span className="text-red-600 text-sm self-center">{error}</span>
        )}
        <button
          onClick={createInvite}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
        >
          {loading ? "Sending..." : "Send Invite"}
        </button>
      </div>

      <div className="space-y-2">
        {invites.map((inv) => {
          const acceptUrl = `${location.origin}/invite/accept?token=${inv.token}`;
          return (
            <div
              key={inv.id}
              className="border rounded p-3 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{inv.email}</div>
                <div className="text-sm text-gray-600">
                  Expires: {new Date(inv.expiresAt).toLocaleString()}
                </div>
                {inv.acceptedAt ? (
                  <div className="text-green-600 text-sm">
                    Accepted: {new Date(inv.acceptedAt).toLocaleString()}
                  </div>
                ) : (
                  <div className="text-yellow-700 text-sm">Pending</div>
                )}
              </div>
              <div className="text-sm break-all max-w-[50%] flex items-center gap-2">
                <span className="text-gray-600">Invite Link:</span> {acceptUrl}
                <button
                  onClick={() =>
                    navigator.clipboard
                      .writeText(acceptUrl)
                      .then(() => message.success("Copied"))
                  }
                  className="ml-2 px-2 py-1 border rounded"
                >
                  Copy
                </button>
              </div>
            </div>
          );
        })}
        {invites.length === 0 && (
          <div className="text-sm text-gray-600">No invites found.</div>
        )}
      </div>
    </div>
  );
}
