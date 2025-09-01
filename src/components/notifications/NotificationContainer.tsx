"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { X } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function NotificationContainer() {
  const { socket } = useSocket();
  const store = useStore();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string>("");
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handler = (data: { orderId: string; providerIds: string[] }) => {
      // Lightweight client-side filter: use store when available, else localStorage
      const currentUserId =
        store.user?.id || localStorage.getItem("userId") || "";
      if (
        currentUserId &&
        Array.isArray(data.providerIds) &&
        !data.providerIds.includes(currentUserId)
      ) {
        return;
      }

      try {
        const audio = new Audio("/sounds/notification.wav");
        audio.volume = 0.5;
        void audio.play();
      } catch {}

      setMessage(`Order ${data.orderId} was cancelled by customer`);
      setVisible(true);

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setVisible(false), 3500);
    };

    socket.on("order-cancelled", handler);
    return () => {
      socket.off("order-cancelled", handler);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [socket, store.user?.id]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000]">
      <div className="px-4 py-3 rounded-md shadow-lg bg-black/80 border border-purple-500/40 text-white flex items-center gap-3">
        <span className="text-sm">{message}</span>
        <button
          type="button"
          aria-label="Close"
          className="ml-2 p-1 hover:bg-white/10 rounded"
          onClick={() => setVisible(false)}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
