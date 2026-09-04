"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import {
  fetchFriendsList,
  fetchFriendRequests,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
  fetchFriendSuggestions,
  FriendUser,
  FriendRequestItem,
} from "../../services/api";

interface ChatRoom {
  id: string; // conv_ID or group_ID
  conversationId?: string;
  groupId?: string;
  type: "dm" | "group";
  name: string;
  avatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  online?: boolean;
  memberCount?: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  sentAt: string;
  sender: {
    id: string;
    username: string | null;
    email: string;
    avatar: string | null;
  };
  attachmentUrl?: string | null;
  attachmentType?: string | null;
}

function getSafeName(u?: { username?: string | null; email?: string | null } | null, fallback = "User"): string {
  if (!u) return fallback;
  if (u.username && u.username.trim()) return u.username.trim();
  if (u.email && typeof u.email === "string" && u.email.includes("@")) return u.email.split("@")[0];
  if (u.email && typeof u.email === "string") return u.email;
  return fallback;
}

function getSafeInitial(name?: string | null, fallback = "U"): string {
  if (!name || typeof name !== "string" || !name.trim()) return fallback;
  return name.trim()[0].toUpperCase();
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Sidebar navigation
  const [sidebarTab, setSidebarTab] = useState<"chats" | "friends">("chats");

  // Chat rooms & messages
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Friend System states
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequestItem[]>([]);
  const [suggestions, setSuggestions] = useState<FriendUser[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalInput, setModalInput] = useState("");
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // WebSockets & Typing Indicators State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Protect Route
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("tf_token") : null;
    if (!authLoading && !token) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Show Toast Notification
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Rooms (Conversations & Groups)
  const fetchRooms = async () => {
    const token = localStorage.getItem("tf_token");
    if (!token) return;

    try {
      const [resDMs, resGroups] = await Promise.all([
        fetch("http://127.0.0.1:3003/api/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://127.0.0.1:3003/api/groups", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const jsonDMs = await resDMs.json();
      const jsonGroups = await resGroups.json();

      let dms: ChatRoom[] = [];
      if (jsonDMs.success && jsonDMs.data?.conversations) {
        dms = jsonDMs.data.conversations;
      }

      let groups: ChatRoom[] = [];
      if (jsonGroups.success && jsonGroups.data?.groups) {
        groups = jsonGroups.data.groups;
      }

      const combined = [...dms, ...groups];
      combined.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

      setChatRooms(combined);

      if (combined.length > 0 && !activeRoom) {
        setActiveRoom(combined[0]);
      }
    } catch (err) {
      console.error("Failed to load chat rooms:", err);
    }
  };

  // Load Friend Data
  const loadFriendsData = useCallback(async () => {
    const token = localStorage.getItem("tf_token");
    if (!token) return;
    setFriendsLoading(true);

    try {
      const [friendsList, requestsList, suggestList] = await Promise.all([
        fetchFriendsList(token).catch(() => []),
        fetchFriendRequests(token, "all").catch(() => []),
        fetchFriendSuggestions(token).catch(() => []),
      ]);

      setFriends(friendsList);
      setFriendRequests(requestsList);
      setSuggestions(suggestList);
    } catch (err) {
      console.error("Failed to load friends data:", err);
    } finally {
      setFriendsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (user) {
      fetchRooms();
      loadFriendsData();
    }
  }, [user, loadFriendsData]);

  // Fetch Message History for an Active Room
  const fetchMessages = async (room: ChatRoom) => {
    const token = localStorage.getItem("tf_token");
    if (!token) return;

    try {
      const url = room.type === "dm"
        ? `http://127.0.0.1:3003/api/conversations/${room.conversationId}/messages`
        : `http://127.0.0.1:3003/api/groups/${room.groupId}/messages`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data?.messages) {
        setMessages(json.data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  // WebSockets connection setup
  useEffect(() => {
    const token = localStorage.getItem("tf_token");
    if (!token || !user) return;

    const newSocket = io("http://127.0.0.1:3003", {
      auth: { token },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("WebSocket connected to chat service");
    });

    newSocket.on("receiveMessage", (message: Message & { conversationId?: string; groupId?: string }) => {
      setMessages((prev) => {
        const isCurrentDM = activeRoom?.type === "dm" && message.conversationId === activeRoom.conversationId;
        const isCurrentGroup = activeRoom?.type === "group" && message.groupId === activeRoom.groupId;

        if (isCurrentDM || isCurrentGroup) {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        }
        return prev;
      });
      fetchRooms();
    });

    newSocket.on("typingStart", (data: { userId: string; conversationId?: string; groupId?: string }) => {
      const isCurrentDM = activeRoom?.type === "dm" && data.conversationId === activeRoom.conversationId;
      const isCurrentGroup = activeRoom?.type === "group" && data.groupId === activeRoom.groupId;

      if (isCurrentDM || isCurrentGroup) {
        setTypingUsers((prev) => (prev.includes(data.userId) ? prev : [...prev, data.userId]));
      }
    });

    newSocket.on("typingStop", (data: { userId: string; conversationId?: string; groupId?: string }) => {
      setTypingUsers((prev) => prev.filter((uid) => uid !== data.userId));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, activeRoom?.conversationId, activeRoom?.groupId]);

  // Handle activeRoom switching
  useEffect(() => {
    if (!socket || !activeRoom) return;

    const data = activeRoom.type === "dm"
      ? { conversationId: activeRoom.conversationId }
      : { groupId: activeRoom.groupId };

    const joinEvent = activeRoom.type === "dm" ? "joinConversation" : "joinGroup";
    const leaveEvent = activeRoom.type === "dm" ? "leaveConversation" : "leaveGroup";

    socket.emit(joinEvent, data);
    fetchMessages(activeRoom);

    setTypingUsers([]);

    return () => {
      socket.emit(leaveEvent, data);
      setMessages([]);
      setTypingUsers([]);
    };
  }, [activeRoom, socket]);

  // Typing emitter
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!socket || !activeRoom) return;

    if (!isTyping) {
      setIsTyping(true);
      const eventPayload = activeRoom.type === "dm"
        ? { conversationId: activeRoom.conversationId }
        : { groupId: activeRoom.groupId };
      socket.emit("typingStart", eventPayload);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      const eventPayload = activeRoom.type === "dm"
        ? { conversationId: activeRoom.conversationId }
        : { groupId: activeRoom.groupId };
      socket.emit("typingStop", eventPayload);
      setIsTyping(false);
    }, 3000);
  };

  // Send Message
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !activeRoom) return;

    const payload = activeRoom.type === "dm"
      ? { conversationId: activeRoom.conversationId, content: inputText.trim() }
      : { groupId: activeRoom.groupId, content: inputText.trim() };

    socket.emit("sendMessage", payload);

    const typingStopPayload = activeRoom.type === "dm"
      ? { conversationId: activeRoom.conversationId }
      : { groupId: activeRoom.groupId };
    socket.emit("typingStop", typingStopPayload);
    setIsTyping(false);

    setInputText("");
  };

  // Search users live in Add Friend Modal
  useEffect(() => {
    const query = modalInput.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const token = localStorage.getItem("tf_token");
      if (!token) return;
      setIsSearching(true);
      try {
        const res = await fetch(`http://127.0.0.1:3003/api/chat/search?query=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success && json.data?.users) {
          setSearchResults(json.data.users);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [modalInput]);

  // Send Friend Request
  const handleSendRequest = async (identifier: string) => {
    const token = localStorage.getItem("tf_token");
    if (!token || !identifier) return;

    setActionLoadingId(identifier);
    try {
      const res = await sendFriendRequest(token, identifier);
      showToast(res.accepted ? "Friend added instantly!" : "Friend request sent!");
      setModalInput("");
      setSearchResults([]);
      setShowAddModal(false);
      loadFriendsData();
    } catch (err: any) {
      showToast(err.message || "Could not send friend request.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Respond to Friend Request (Accept or Reject)
  const handleRespondRequest = async (requestId: string, status: "ACCEPTED" | "REJECTED") => {
    const token = localStorage.getItem("tf_token");
    if (!token) return;

    setActionLoadingId(requestId);
    try {
      await respondToFriendRequest(token, requestId, status);
      showToast(status === "ACCEPTED" ? "Friend request accepted!" : "Friend request declined.");
      loadFriendsData();
    } catch (err: any) {
      showToast(err.message || "Failed to update request.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Remove Friend
  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    if (!confirm(`Are you sure you want to remove ${friendName} from friends?`)) return;
    const token = localStorage.getItem("tf_token");
    if (!token) return;

    try {
      await removeFriend(token, friendId);
      showToast(`${friendName} removed from friends.`);
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
    } catch (err: any) {
      showToast(err.message || "Failed to remove friend.");
    }
  };

  // Start DM Chat with Friend
  const startChatWithFriend = async (friend: FriendUser) => {
    const token = localStorage.getItem("tf_token");
    if (!token) return;

    try {
      const res = await fetch("http://127.0.0.1:3003/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otherUserId: friend.id }),
      });
      const json = await res.json();

      if (json.success && json.data?.conversation) {
        const conv = json.data.conversation;
        const room: ChatRoom = {
          id: `conv_${conv.id}`,
          conversationId: conv.id,
          type: "dm",
          name: getSafeName(friend, "Friend"),
          avatar: friend.avatar || null,
          lastMessage: "Conversation opened",
          lastMessageAt: new Date().toISOString(),
          online: friend.isOnline,
        };

        setChatRooms((prev) => [room, ...prev.filter((r) => r.conversationId !== conv.id)]);
        setActiveRoom(room);
        setSidebarTab("chats");
        setMobileShowChat(true);
      }
    } catch (err) {
      console.error("Failed to start chat with friend:", err);
      showToast("Unable to open chat conversation.");
    }
  };

  // Filter local chats
  const filteredRooms = useMemo(() => {
    return chatRooms.filter((room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chatRooms, searchQuery]);

  // Filter local friends
  const filteredFriends = useMemo(() => {
    return friends.filter((f) =>
      getSafeName(f, "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [friends, searchQuery]);

  // Incoming pending requests
  const incomingRequests = useMemo(() => {
    if (!user) return [];
    return friendRequests.filter((r) => r.receiverId === user.id && r.status === "PENDING");
  }, [friendRequests, user]);

  const activeFriendInitials = useMemo(() => {
    if (!activeRoom?.name) return "TF";
    return activeRoom.name
      .split(/\s+/)
      .map((n) => n[0] || "")
      .join("")
      .substring(0, 2)
      .toUpperCase() || "TF";
  }, [activeRoom]);

  // Loading screen
  if (authLoading || !user) {
    return (
      <div className="setup-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)" }}>
        <p style={{ color: "var(--text-soft)" }}>Connecting to server...</p>
      </div>
    );
  }

  return (
    <div className="messages-page-wrapper">

      {/* ─── Left Sidebar ────────────────────────────────────────── */}
      <aside className={`messages-sidebar${mobileShowChat ? " mobile-hidden" : ""}`}>
        
        {/* Header & Add Friend Button */}
        <div className="messages-sidebar-header" style={{ paddingBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "var(--text)" }}>Messages</h1>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="btn btn-gradient btn-sm"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                fontSize: 12,
                borderRadius: "var(--r-full)"
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Friend
            </button>
          </div>

          {/* Tab Switcher: Chats vs Friends */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: "var(--bg-soft)",
            padding: 3,
            borderRadius: 10,
            marginBottom: 12,
            border: "1px solid var(--border)"
          }}>
            <button
              type="button"
              onClick={() => setSidebarTab("chats")}
              style={{
                padding: "6px 10px",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: sidebarTab === "chats" ? 700 : 500,
                background: sidebarTab === "chats" ? "var(--surface)" : "transparent",
                color: sidebarTab === "chats" ? "var(--text)" : "var(--text-soft)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: sidebarTab === "chats" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
              }}
            >
              Chats ({chatRooms.length})
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab("friends")}
              style={{
                padding: "6px 10px",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: sidebarTab === "friends" ? 700 : 500,
                background: sidebarTab === "friends" ? "var(--surface)" : "transparent",
                color: sidebarTab === "friends" ? "var(--text)" : "var(--text-soft)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                boxShadow: sidebarTab === "friends" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
              }}
            >
              Friends ({friends.length})
              {incomingRequests.length > 0 && (
                <span style={{
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 99,
                  padding: "1px 6px",
                  lineHeight: "14px"
                }}>
                  {incomingRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* Search box */}
          <div className="friend-search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder={sidebarTab === "chats" ? "Search chats..." : "Search friends..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ─── CHATS TAB LIST ──────────────────────────────────────── */}
        {sidebarTab === "chats" && (
          <div className="messages-friends-list">
            {filteredRooms.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-soft)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, margin: "0 auto 8px" }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>No active chats</p>
                <p style={{ fontSize: 11, color: "var(--muted)" }}>Click "Add Friend" or choose a friend to begin chatting.</p>
              </div>
            ) : (
              filteredRooms.map((room) => {
                const initials = (room.name || "Chat")
                  .split(/\s+/)
                  .map((n) => n[0] || "")
                  .join("")
                  .substring(0, 2)
                  .toUpperCase() || "C";

                return (
                  <button
                    key={room.id}
                    type="button"
                    className={`friend-item${activeRoom?.id === room.id ? " active" : ""}`}
                    onClick={() => {
                      setActiveRoom(room);
                      setMobileShowChat(true);
                    }}
                  >
                    <div className="friend-avatar-wrapper">
                      <div className="friend-avatar">{initials}</div>
                      {room.type === "dm" && (
                        <div className={`status-dot${room.online ? " online" : ""}`} />
                      )}
                    </div>
                    <div className="friend-info">
                      <div className="friend-name">{room.name}</div>
                      <div className="friend-status-text" style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "160px" }}>
                        {room.lastMessage}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* ─── FRIENDS TAB CONTENT ─────────────────────────────────── */}
        {sidebarTab === "friends" && (
          <div className="messages-friends-list" style={{ padding: "0 12px 16px" }}>

            {/* Pending Friend Requests Section */}
            {incomingRequests.length > 0 && (
              <div style={{ marginBottom: 18, background: "var(--surface)", border: "1px solid rgba(0, 201, 141, 0.3)", borderRadius: 12, padding: "12px 10px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
                  Friend Requests ({incomingRequests.length})
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {incomingRequests.map((req) => {
                    const senderName = getSafeName(req.sender, "User");
                    return (
                      <div
                        key={req.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: "var(--bg)",
                          border: "1px solid var(--border)"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--purple)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {getSafeInitial(senderName, "U")}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {senderName}
                            </p>
                            <p style={{ fontSize: 10, color: "var(--muted)", margin: 0 }}>Sent request</p>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => handleRespondRequest(req.id, "ACCEPTED")}
                            disabled={actionLoadingId === req.id}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              border: "none",
                              background: "var(--accent)",
                              color: "#fff",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRespondRequest(req.id, "REJECTED")}
                            disabled={actionLoadingId === req.id}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              border: "1px solid var(--border)",
                              background: "transparent",
                              color: "var(--text-soft)",
                              fontSize: 11,
                              cursor: "pointer"
                            }}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Friends Count Label */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, padding: "0 4px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                All Friends ({filteredFriends.length})
              </span>
            </div>

            {/* Friends list */}
            {friendsLoading ? (
              <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>Loading friends...</p>
            ) : filteredFriends.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 12px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>No friends added yet</p>
                <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>Connect with your friends to share looks and get outfit advice.</p>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-gradient btn-sm"
                  style={{ padding: "6px 14px", fontSize: 12 }}
                >
                  Find Friends
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {filteredFriends.map((friend) => {
                  const name = getSafeName(friend, "Friend");
                  const initial = getSafeInitial(name, "F");

                  return (
                    <div
                      key={friend.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        <div style={{ position: "relative" }}>
                          {friend.avatar ? (
                            <img
                              src={friend.avatar.startsWith("/public") ? `http://127.0.0.1:3003${friend.avatar}` : friend.avatar}
                              alt={name}
                              style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }}
                            />
                          ) : (
                            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--accent-grad)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                              {initial}
                            </div>
                          )}
                          <div style={{
                            position: "absolute",
                            bottom: -1,
                            right: -1,
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            background: friend.isOnline ? "#10b981" : "#71717a",
                            border: "1.5px solid var(--surface)"
                          }} />
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {name}
                          </p>
                          <p style={{ fontSize: 10, color: "var(--muted)", margin: 0 }}>
                            {friend.isOnline ? "Active now" : "Offline"}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => startChatWithFriend(friend)}
                          className="btn btn-gradient btn-sm"
                          style={{ padding: "5px 10px", fontSize: 11 }}
                          title="Message Friend"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          Chat
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFriend(friend.id, name)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--muted)",
                            padding: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center"
                          }}
                          title="Remove Friend"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Suggested Connections Section */}
            {suggestions.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, padding: "0 4px" }}>
                  Suggested Connections
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {suggestions.slice(0, 4).map((sugg) => {
                    const suggName = getSafeName(sugg, "Stylist");
                    return (
                      <div
                        key={sugg.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: 10,
                          background: "var(--surface)",
                          border: "1px solid var(--border)"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--purple)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                            {getSafeInitial(suggName, "S")}
                          </div>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>{suggName}</p>
                            <p style={{ fontSize: 10, color: "var(--muted)", margin: 0 }}>Fashion enthusiast</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSendRequest(sugg.username || sugg.email || sugg.id)}
                          disabled={actionLoadingId === (sugg.username || sugg.email || sugg.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "4px 10px", fontSize: 11 }}
                        >
                          + Add
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </aside>

      {/* ─── Right Chat Panel ────────────────────────────────────── */}
      <div className={`messages-chat-pane${!mobileShowChat ? " mobile-hidden" : ""}`}>
        {activeRoom ? (
          <>
            {/* Chat Box Header */}
            <div className="messages-chat-header">
              {/* Mobile Back Button */}
              <button
                type="button"
                className="messages-mobile-back-btn"
                onClick={() => setMobileShowChat(false)}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                </svg>
                Back
              </button>

              <div className="friend-avatar-wrapper">
                <div className="friend-avatar" style={{ background: "var(--purple)", color: "#fff" }}>
                  {activeFriendInitials}
                </div>
                {activeRoom.type === "dm" && (
                  <div className={`status-dot${activeRoom.online ? " online" : ""}`} />
                )}
              </div>
              <div>
                <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>{activeRoom.name}</h4>
                <p style={{ fontSize: 10, color: "var(--muted)" }}>
                  {activeRoom.type === "group" ? `Group chat · ${activeRoom.memberCount || 1} members` : activeRoom.online ? "Active now" : "Offline"}
                </p>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="messages-chat-messages chat-messages">
              {messages.length === 0 ? (
                <div className="chat-empty">
                  <span className="chat-empty-icon" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </span>
                  <p style={{ fontSize: 12 }}>No messages yet. Say hello to start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isYou = msg.senderId === user.id;
                  const formattedTime = new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                  return (
                    <div key={msg.id} className={`message-item ${isYou ? "you" : "friend"}`}>
                      {!isYou && activeRoom.type === "group" && (
                        <p style={{ fontSize: 10, color: "var(--muted)", margin: "0 0 2px 4px" }}>
                          {getSafeName(msg.sender, "User")}
                        </p>
                      )}
                      <div className="message-bubble">
                        {msg.content}
                        {msg.attachmentUrl && (
                          <div style={{ marginTop: 8 }}>
                            <img src={msg.attachmentUrl} alt="Attachment" style={{ maxWidth: "100%", borderRadius: "var(--r-xs)", display: "block" }} />
                          </div>
                        )}
                      </div>
                      <span className="message-meta">{formattedTime}</span>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="message-item friend">
                  <div className="message-bubble" style={{ fontStyle: "italic", opacity: 0.8, display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="typing-dots">Someone is typing</span>
                    <span className="dot-pulse" />
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Message Input Footer */}
            <div className="messages-chat-footer">
              <form className="chat-input-form" onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder={`Message ${(activeRoom.name || "Friend").split(/\s+/)[0]}...`}
                  value={inputText}
                  onChange={handleInputChange}
                  className="chat-input"
                />
                <button type="submit" className="chat-send-btn" disabled={!inputText.trim()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-soft)" }}>
            <div style={{ display: "inline-flex", padding: 16, borderRadius: "50%", background: "var(--bg-soft)", color: "var(--muted)", marginBottom: 16 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>No Chat Selected</h3>
            <p style={{ fontSize: "13px", color: "var(--muted)" }}>Choose a conversation from the sidebar or select a friend.</p>
          </div>
        )}
      </div>

      {/* ─── ADD FRIEND MODAL ──────────────────────────────────────── */}
      {showAddModal && (
        <div
          className="modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
        >
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "28px 24px",
              maxWidth: 460,
              width: "100%",
              boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
              position: "relative"
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0, 201, 141, 0.12)", border: "1px solid rgba(0, 201, 141, 0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "var(--text)" }}>Add a Fashion Friend</h3>
                  <p style={{ fontSize: 12, color: "var(--text-soft)", margin: 0 }}>Connect to share outfit feedback &amp; looks.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--muted)",
                  fontSize: 20,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: 4
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Search Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (modalInput.trim()) handleSendRequest(modalInput.trim());
              }}
              style={{ marginBottom: 16 }}
            >
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                Username or Email
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}
                  >
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="e.g. priya_sharma or friend@gmail.com"
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px",
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "var(--text)",
                      outline: "none"
                    }}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={!modalInput.trim() || !!actionLoadingId}
                  className="btn btn-gradient btn-sm"
                  style={{ padding: "0 16px", fontSize: 13, fontWeight: 600 }}
                >
                  Send
                </button>
              </div>
            </form>

            {/* Live Search Results */}
            <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {isSearching ? (
                <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "16px 0" }}>Searching users...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map((resUser) => {
                  const isFriend = friends.some((f) => f.id === resUser.id);
                  const isSelf = resUser.id === user.id;
                  const resName = getSafeName(resUser, "User");

                  return (
                    <div
                      key={resUser.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "var(--bg)",
                        border: "1px solid var(--border)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent-grad)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                          {getSafeInitial(resName, "U")}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{resName}</p>
                          <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>{resUser.email || "No email"}</p>
                        </div>
                      </div>

                      {isSelf ? (
                        <span style={{ fontSize: 11, color: "var(--muted)", padding: "4px 8px" }}>You</span>
                      ) : isFriend ? (
                        <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, padding: "4px 8px" }}>Friends</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendRequest(resUser.username || resUser.email)}
                          disabled={actionLoadingId === (resUser.username || resUser.email)}
                          className="btn btn-gradient btn-sm"
                          style={{ padding: "5px 12px", fontSize: 11 }}
                        >
                          Add Friend
                        </button>
                      )}
                    </div>
                  );
                })
              ) : modalInput.trim() ? (
                <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "12px 0" }}>
                  Press Send above to dispatch request directly to <strong>{modalInput}</strong>.
                </p>
              ) : (
                <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "14px 0" }}>
                  Type a username or email to find stylists and friends.
                </p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ─── Notification Toast ──────────────────────────────────── */}
      {toast && (
        <div className="toast-notification">
          <span className="toast-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span className="toast-text">{toast}</span>
        </div>
      )}

    </div>
  );
}
