"use client";

import { useEffect, useState } from "react";
import io, { type Socket } from "socket.io-client";
import type { ChatMessage, TypingData } from "../lib/socket";

// ------------------------------------------
// connect the socket connection for realtime
// ------------------------------------------
export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Fix for production: use window.location.origin instead of empty string
    const socketUrl =
      process.env.NODE_ENV === "production"
        ? window.location.origin
        : "http://localhost:3000";

    const socketInstance = io(socketUrl, {
      path: "/api/socket/",
      addTrailingSlash: true,
      // Force polling first to avoid WebSocket upgrade issues
      transports: ["polling"],
      timeout: 30000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      // Additional stability options
      forceNew: true,
      upgrade: false, // Disable WebSocket upgrade to prevent disconnects
    });

    socketInstance.on("connect", () => {
      console.log("✅ CONNECTED to socket server - ID:", socketInstance.id);
      console.log("🔌 Transport:", socketInstance.io.engine.transport.name);
      setIsConnected(true);
      // Expose globally for lightweight emits in pages without hook
      // @ts-ignore
      (window as any).__socketInstance = socketInstance;
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ DISCONNECTED from socket server");
      console.log("📍 Disconnect reason:", reason);
      console.log("🔍 Socket ID was:", socketInstance.id);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("💥 Socket connection error:", error);
      setIsConnected(false);
    });

    // Additional event handlers for debugging
    socketInstance.io.on("error", (error) => {
      console.error("🚨 Engine error:", error);
    });

    socketInstance.io.engine.on("close", (reason) => {
      console.log("🔒 Engine closed:", reason);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, isConnected };
}
// --------------------------------
// get all the chats for the order
// --------------------------------
export function useOrderChat(
  orderId: string,
  currentUser: { id: string; username: string; avatar?: string; role: string }
) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Sound functions
  const playNotificationSound = () => {
    // Check if sound is enabled in localStorage
    const soundEnabled = localStorage.getItem("chatSoundEnabled") !== "false";
    if (!soundEnabled) return;

    try {
      const audio = new Audio("/sounds/notification.wav");
      audio.volume = 0.5;
      audio.play().catch(console.error);
    } catch (error) {
      console.error("Failed to play notification sound:", error);
    }
  };

  const playSendSound = () => {
    // Check if sound is enabled in localStorage
    const soundEnabled = localStorage.getItem("chatSoundEnabled") !== "false";
    if (!soundEnabled) return;

    try {
      const audio = new Audio("/sounds/send.mp3");
      audio.volume = 0.3;
      audio.play().catch(console.error);
    } catch (error) {
      console.error("Failed to play send sound:", error);
    }
  };

  useEffect(() => {
    if (!socket || !orderId) return;

    socket.emit("join-order", orderId);
    loadMessages();

    socket.on("new-message", (message: ChatMessage) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        if (exists) return prev;
        return [...prev, message].sort((a, b) => a.timestamp - b.timestamp);
      });

      // Play notification sound for messages from other users
      if (message.senderId !== currentUser.id) {
        playNotificationSound();
      }
    });

    socket.on("user-typing", (data: TypingData) => {
      if (data.userId !== currentUser.id) {
        setTypingUsers((prev) => {
          if (data.isTyping) {
            return prev.includes(data.userName)
              ? prev
              : [...prev, data.userName];
          } else {
            return prev.filter((name) => name !== data.userName);
          }
        });
      }
    });

    return () => {
      socket.emit("leave-order", orderId);
      socket.off("new-message");
      socket.off("user-typing");
    };
  }, [socket, orderId, currentUser.id]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/messages`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!socket || !message.trim()) return;

    const messageData: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      senderId: currentUser.id,
      senderName: currentUser.username,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.role as any,
      message: message.trim(),
      timestamp: Date.now(),
      type: "message",
    };

    // Play send sound
    playSendSound();

    socket.emit("send-message", messageData);

    try {
      await fetch(`/api/orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          senderId: currentUser.id,
        }),
      });
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  };

  const sendTyping = (isTyping: boolean) => {
    if (!socket) return;

    socket.emit("typing", {
      userId: currentUser.id,
      userName: currentUser.username,
      orderId,
      isTyping,
    });
  };

  return {
    messages,
    typingUsers,
    isConnected,
    sendMessage,
    sendTyping,
    loadMessages,
  };
}
