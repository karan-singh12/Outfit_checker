"use client";
import { useState, useMemo, useEffect, useRef } from "react";

interface Friend {
  name: string;
  handle: string;
  initials: string;
  online: boolean;
  statusText: string;
}

interface Message {
  sender: "You" | string;
  text: string;
  timestamp: string;
  sharedOutfit?: {
    id: string;
    title: string;
    image: string;
    author: string;
  };
}

const INITIAL_FRIENDS: Friend[] = [
  { name: "Emma Watson", handle: "@emma", initials: "EW", online: true, statusText: "Active now" },
  { name: "Ethan Hunt", handle: "@ethan", initials: "EH", online: true, statusText: "Active 5m ago" },
  { name: "Sophia Loren", handle: "@sophia", initials: "SL", online: true, statusText: "Active now" },
  { name: "Liam Neeson", handle: "@liam", initials: "LN", online: false, statusText: "Offline" }
];

const INITIAL_CHATS: Record<string, Message[]> = {
  "Emma Watson": [
    { sender: "Emma Watson", text: "Hey! Did you check out the new dark blue theme update? It looks so premium!", timestamp: "4:15 PM" },
    { sender: "You", text: "Yes! The midnight blue vibes are gorgeous.", timestamp: "4:16 PM" }
  ],
  "Ethan Hunt": [
    { sender: "Ethan Hunt", text: "That Date Night fit on the trending page is amazing. Planning to try it on in the Studio.", timestamp: "2:30 PM" }
  ],
  "Sophia Loren": [
    { sender: "Sophia Loren", text: "Are we going out this Saturday? Need to style something nice.", timestamp: "11:24 AM" }
  ],
  "Liam Neeson": [
    { sender: "Liam Neeson", text: "Catch you later, leaving for work.", timestamp: "Yesterday" }
  ]
};

const AUTO_REPLIES: Record<string, string[]> = {
  "Emma Watson": [
    "Oh, I love that styling! It looks super cozy yet chic.",
    "Nice choice! I might borrow that outfit for my brunch this weekend.",
    "Wow, beautiful look! The colors are absolutely matching.",
    "That is so elegant! You should try trying it on in the AI Studio."
  ],
  "Ethan Hunt": [
    "Awesome! Let me customize it a bit on my avatar.",
    "That looks sleek. Adding it to my saved looks right now!",
    "Great recommendation. Very clean!",
    "Exactly what I was looking for. Appreciate you sharing it!"
  ],
  "Sophia Loren": [
    "Super cool fit! We should definitely match this Saturday.",
    "Gorgeous! I love how simple yet trendy that looks.",
    "Thanks for sharing! Let's style it with different accessories in the wardrobe page.",
    "Love the tag choices on this one!"
  ],
  "Liam Neeson": [
    "Nice! I will take a look once I am back home.",
    "Impressive outfit combination.",
    "Thanks for sending, looks very neat.",
    "Interesting layer choice. I'll save it."
  ]
};

export default function MessagesPage() {
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [searchFriend, setSearchFriend] = useState("");
  const [newFriendName, setNewFriendName] = useState("");
  const [activeFriend, setActiveFriend] = useState<Friend>(INITIAL_FRIENDS[0]);
  const [chats, setChats] = useState<Record<string, Message[]>>(INITIAL_CHATS);
  const [inputText, setInputText] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeFriend]);

  // Filter friends list by name or handle
  const filteredFriends = useMemo(() => {
    return friends.filter(friend => {
      const query = searchFriend.toLowerCase();
      return (
        friend.name.toLowerCase().includes(query) ||
        friend.handle.toLowerCase().includes(query)
      );
    });
  }, [friends, searchFriend]);

  const showToastNotification = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const getFormattedTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const triggerFriendReply = (friendName: string) => {
    setTimeout(() => {
      const replies = AUTO_REPLIES[friendName] || ["Awesome!", "Haha sounds good!", "Let's check it out!"];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      const newReply: Message = {
        sender: friendName,
        text: randomReply,
        timestamp: getFormattedTime()
      };

      setChats(prev => ({
        ...prev,
        [friendName]: [...(prev[friendName] || []), newReply]
      }));
    }, 1500);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const timestamp = getFormattedTime();
    const newMessage: Message = {
      sender: "You",
      text: inputText.trim(),
      timestamp
    };

    const targetFriend = activeFriend.name;
    setChats(prev => ({
      ...prev,
      [targetFriend]: [...(prev[targetFriend] || []), newMessage]
    }));

    setInputText("");

    // Trigger reply
    triggerFriendReply(targetFriend);
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newFriendName.trim();
    if (!name) return;

    // Check if already in friends
    if (friends.some(f => f.name.toLowerCase() === name.toLowerCase())) {
      showToastNotification(`${name} is already in your friends list!`);
      setNewFriendName("");
      return;
    }

    const initials = name
      .split(" ")
      .map(part => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "FR";

    const handle = "@" + name.toLowerCase().replace(/\s+/g, "");

    const newFriend: Friend = {
      name,
      handle,
      initials,
      online: true,
      statusText: "Active now"
    };

    setFriends(prev => [...prev, newFriend]);
    setChats(prev => ({
      ...prev,
      [name]: [{ sender: name, text: `Hey! Thanks for adding me. Let's share outfits!`, timestamp: getFormattedTime() }]
    }));

    setActiveFriend(newFriend);
    setMobileShowChat(true);
    showToastNotification(`Added ${name} to friends!`);
    setNewFriendName("");
  };

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
              value={searchFriend}
              onChange={(e) => setSearchFriend(e.target.value)}
            />
          </div>
        </div>

        {/* Add friend panel */}
        <div className="friend-add-section">
          <p className="friend-add-title">Add Friend</p>
          <form className="friend-add-form" onSubmit={handleAddFriend}>
            <input
              type="text"
              placeholder="Friend's full name..."
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              className="friend-add-input"
            />
            <button type="submit" className="btn btn-gradient btn-sm" disabled={!newFriendName.trim()} style={{ padding: "6px 12px" }}>
              Add
            </button>
          </form>
        </div>

        {/* Friends List */}
        <div className="messages-friends-list">
          {filteredFriends.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>No chats found.</p>
          ) : (
            filteredFriends.map(friend => (
              <button
                key={friend.name}
                type="button"
                className={`friend-item${activeFriend.name === friend.name ? " active" : ""}`}
                onClick={() => {
                  setActiveFriend(friend);
                  setMobileShowChat(true);
                }}
              >
                <div className="friend-avatar-wrapper">
                  <div className="friend-avatar">{friend.initials}</div>
                  <div className={`status-dot${friend.online ? " online" : ""}`}></div>
                </div>
                <div className="friend-info">
                  <div className="friend-name">{friend.name}</div>
                  <div className="friend-status-text">{friend.statusText}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Right chat panel */}
      <div className={`messages-chat-pane${!mobileShowChat ? " mobile-hidden" : ""}`}>
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
              {activeFriend.initials}
            </div>
            <div className={`status-dot${activeFriend.online ? " online" : ""}`}></div>
          </div>
          <div>
            <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>{activeFriend.name}</h4>
            <p style={{ fontSize: 10, color: "var(--muted)" }}>{activeFriend.statusText} · {activeFriend.handle}</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="messages-chat-messages chat-messages">
          {(chats[activeFriend.name] || []).length === 0 ? (
            <div className="chat-empty">
              <span className="chat-empty-icon">💬</span>
              <p style={{ fontSize: 12 }}>No messages yet. Say hello to start the conversation!</p>
            </div>
          ) : (
            (chats[activeFriend.name] || []).map((msg, i) => (
              <div key={i} className={`message-item ${msg.sender === "You" ? "you" : "friend"}`}>
                <div className="message-bubble">
                  {msg.text}

                  {/* Shared Outfit Preview */}
                  {msg.sharedOutfit && (
                    <div className="message-fit-card" onClick={() => window.location.href = "/studio"}>
                      <div className="message-fit-thumb">
                        <img src={msg.sharedOutfit.image} alt={msg.sharedOutfit.title} />
                      </div>
                      <div className="message-fit-info">
                        <p className="message-fit-name">{msg.sharedOutfit.title}</p>
                        <p className="message-fit-author">by {msg.sharedOutfit.author}</p>
                      </div>
                    </div>
                  )}
                </div>
                <span className="message-meta">{msg.timestamp}</span>
              </div>
            ))
          )}
          <div ref={chatBottomRef}></div>
        </div>

        {/* Message input Form */}
        <div className="messages-chat-footer">
          <form className="chat-input-form" onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder={`Message ${activeFriend.name.split(" ")[0]}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="chat-input"
            />
            <button type="submit" className="chat-send-btn" disabled={!inputText.trim()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Notification Toast */}
      {toast && (
        <div className="toast-notification">
          <span className="toast-icon">✨</span>
          <span className="toast-text">{toast}</span>
        </div>
      )}
    </div>
  );
}
