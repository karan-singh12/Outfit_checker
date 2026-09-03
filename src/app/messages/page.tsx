"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

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

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newFriendName, setNewFriendName] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // WebSockets and Typing Indicators State
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
      
      // If we don't have an active room, set the first one as active
      if (combined.length > 0 && !activeRoom) {
        setActiveRoom(combined[0]);
      }
    } catch (err) {
      console.error("Failed to load chat rooms:", err);
    }
  };

  // Load rooms on mount
  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  // Fetch Message History
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

  // Socket Connection setup
  useEffect(() => {
    const token = localStorage.getItem("tf_token");
    if (!token || !user) return;

    const newSocket = io("http://127.0.0.1:3003", {
      auth: { token },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ WebSocket connected to chat service");
    });

    newSocket.on("receiveMessage", (message: Message & { conversationId?: string; groupId?: string }) => {
      // Append message if it belongs to current active conversation
      setMessages((prev) => {
        const isCurrentDM = activeRoom?.type === "dm" && message.conversationId === activeRoom.conversationId;
        const isCurrentGroup = activeRoom?.type === "group" && message.groupId === activeRoom.groupId;

        if (isCurrentDM || isCurrentGroup) {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        }
        return prev;
      });

      // Update sidebar messages and re-sort
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

  // Handle activeRoom switching, Join room / Leave room
  useEffect(() => {
    if (!socket || !activeRoom) return;

    const data = activeRoom.type === "dm"
      ? { conversationId: activeRoom.conversationId }
      : { groupId: activeRoom.groupId };

    const joinEvent = activeRoom.type === "dm" ? "joinConversation" : "joinGroup";
    const leaveEvent = activeRoom.type === "dm" ? "leaveConversation" : "leaveGroup";

    socket.emit(joinEvent, data);
    fetchMessages(activeRoom);

    // Reset typing status on switch
    setTypingUsers([]);

    return () => {
      socket.emit(leaveEvent, data);
      setMessages([]);
      setTypingUsers([]);
    };
  }, [activeRoom, socket]);

  // Show Toast
  const showToastNotification = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // Input changes & Typing state emitters
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

    // Stop typing
    const typingStopPayload = activeRoom.type === "dm"
      ? { conversationId: activeRoom.conversationId }
      : { groupId: activeRoom.groupId };
    socket.emit("typingStop", typingStopPayload);
    setIsTyping(false);

    setInputText("");
  };

  // Create Conversation / Add Friend
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetQuery = newFriendName.trim();
    if (!targetQuery) return;

    const token = localStorage.getItem("tf_token");
    if (!token) return;

    try {
      // 1. Search for user by query
      const searchRes = await fetch(`http://127.0.0.1:3003/api/chat/search?query=${encodeURIComponent(targetQuery)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const searchJson = await searchRes.json();

      if (!searchJson.success || !searchJson.data?.users || searchJson.data.users.length === 0) {
        showToastNotification(`No user found with username or email: "${targetQuery}"`);
        setNewFriendName("");
        return;
      }

      // Start DM with first search result
      const targetUser = searchJson.data.users[0];

      // 2. Post to create conversation
      const startRes = await fetch("http://127.0.0.1:3003/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otherUserId: targetUser.id }),
      });
      const startJson = await startRes.json();

      if (startJson.success && startJson.data?.conversation) {
        const conv = startJson.data.conversation;
        const newRoom: ChatRoom = {
          id: `conv_${conv.id}`,
          conversationId: conv.id,
          type: "dm",
          name: targetUser.username || targetUser.email.split("@")[0],
          avatar: targetUser.avatar || null,
          lastMessage: "No messages yet",
          lastMessageAt: new Date().toISOString(),
          online: targetUser.isOnline,
        };

        setChatRooms((prev) => [newRoom, ...prev.filter((r) => r.conversationId !== conv.id)]);
        setActiveRoom(newRoom);
        setMobileShowChat(true);
        showToastNotification(`Started chat with ${newRoom.name}!`);
      } else {
        showToastNotification(startJson.message || "Failed to start chat.");
      }
    } catch (err) {
      console.error("Failed to add friend/start chat:", err);
      showToastNotification("Failed to connect to backend server.");
    }

    setNewFriendName("");
  };

  // Filter local sidebar rooms list
  const filteredRooms = useMemo(() => {
    return chatRooms.filter((room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chatRooms, searchQuery]);

  const activeFriendInitials = useMemo(() => {
    if (!activeRoom) return "TF";
    return activeRoom.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, [activeRoom]);

  // Loading states
  if (authLoading || !user) {
    return (
      <div className="setup-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)" }}>
        <p style={{ color: "var(--text-soft)" }}>Connecting to server...</p>
      </div>
    );
  }

  return (
    <div className="messages-page-wrapper">
      
      {/* Left sidebar: Friends search and adding */}
      <aside className={`messages-sidebar${mobileShowChat ? " mobile-hidden" : ""}`}>
        <div className="messages-sidebar-header">
          <h1>Chats</h1>
          
          {/* Search friend */}
          <div className="friend-search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Add Friend/Create chat Panel */}
        <div className="friend-add-section">
          <p className="friend-add-title">Start New Chat</p>
          <form className="friend-add-form" onSubmit={handleAddFriend}>
            <input
              type="text"
              placeholder="Username or email..."
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              className="friend-add-input"
            />
            <button type="submit" className="btn btn-gradient btn-sm" disabled={!newFriendName.trim()} style={{ padding: "6px 12px" }}>
              Chat
            </button>
          </form>
        </div>

        {/* Friends/Rooms List */}
        <div className="messages-friends-list">
          {filteredRooms.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>No chats active yet.</p>
          ) : (
            filteredRooms.map((room) => {
              const initials = room.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

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
                      <div className={`status-dot${room.online ? " online" : ""}`}></div>
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
      </aside>

      {/* Right chat panel */}
      <div className={`messages-chat-pane${!mobileShowChat ? " mobile-hidden" : ""}`}>
        {activeRoom ? (
          <>
            {/* Chat box header */}
            <div className="messages-chat-header">
              {/* Mobile Back Button */}
              <button
                type="button"
                className="messages-mobile-back-btn"
                onClick={() => setMobileShowChat(false)}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                Back
              </button>

              <div className="friend-avatar-wrapper">
                <div className="friend-avatar" style={{ background: "var(--purple)", color: "#fff" }}>
                  {activeFriendInitials}
                </div>
                {activeRoom.type === "dm" && (
                  <div className={`status-dot${activeRoom.online ? " online" : ""}`}></div>
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
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </span>
                  <p style={{ fontSize: 12 }}>No messages yet. Say hello to start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isYou = msg.senderId === user.id;
                  const formattedTime = new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={msg.id} className={`message-item ${isYou ? "you" : "friend"}`}>
                      {!isYou && activeRoom.type === "group" && (
                        <p style={{ fontSize: 10, color: "var(--muted)", margin: "0 0 2px 4px" }}>
                          {msg.sender.username || msg.sender.email.split("@")[0]}
                        </p>
                      )}
                      <div className="message-bubble">
                        {msg.content}

                        {/* Attachment/Image Rendering */}
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

              {/* Typing indicator renderer */}
              {typingUsers.length > 0 && (
                <div className="message-item friend">
                  <div className="message-bubble" style={{ fontStyle: "italic", opacity: 0.8, display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="typing-dots">Someone is typing</span>
                    <span className="dot-pulse"></span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef}></div>
            </div>

            {/* Message input Footer */}
            <div className="messages-chat-footer">
              <form className="chat-input-form" onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder={`Message ${activeRoom.name.split(" ")[0]}...`}
                  value={inputText}
                  onChange={handleInputChange}
                  className="chat-input"
                />
                <button type="submit" className="chat-send-btn" disabled={!inputText.trim()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-soft)" }}>
            <div style={{ display: "inline-flex", padding: 16, borderRadius: "50%", background: "var(--bg-soft)", color: "var(--muted)", marginBottom: 16 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>No Chat Selected</h3>
            <p style={{ fontSize: "13px", color: "var(--muted)" }}>Choose a conversation from the sidebar or start a new one.</p>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {toast && (
        <div className="toast-notification">
          <span className="toast-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
          <span className="toast-text">{toast}</span>
        </div>
      )}
    </div>
  );
}
