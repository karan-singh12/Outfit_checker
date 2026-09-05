"use client";

import React, { useState } from "react";

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPhone?: string;
  onSavePhone?: (phone: string) => Promise<void>;
}

interface ChatBubble {
  id: string;
  sender: "user" | "bot";
  text?: string;
  image?: string;
  time: string;
}

const SAMPLE_LINKS = [
  { label: "Zara Floral Maxi", url: "https://zara.com/in/dress/floral-maxi-3920", img: "/images/floral_dress.png" },
  { label: "White Oxford Shirt", url: "https://myntra.com/shirts/oxford-white-92", img: "/images/white_oxford.png" },
  { label: "Black Tailored Trench", url: "https://hm.com/in/trench-coat-black", img: "/images/trench_coat.png" },
];

export default function WhatsAppModal({
  isOpen,
  onClose,
  userPhone = "",
  onSavePhone,
}: WhatsAppModalProps) {
  const [activeTab, setActiveTab] = useState<"simulator" | "connect">("simulator");
  const [phoneInput, setPhoneInput] = useState(userPhone || "");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Simulator state
  const [inputUrl, setInputUrl] = useState("");
  const [isBotProcessing, setIsBotProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatBubble[]>([
    {
      id: "m1",
      sender: "bot",
      text: "👋 Hi! I'm your Threadflank AI Try-On Assistant. Send me any Myntra, Zara, or Amazon product link or photo to see it rendered instantly on your saved digital twin!",
      time: "10:30 AM",
    },
  ]);

  if (!isOpen) return null;

  const handleSendSimulatorMessage = (urlToSend: string, previewImg?: string) => {
    const text = urlToSend.trim();
    if (!text || isBotProcessing) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // User sends link
    const userMsg: ChatBubble = {
      id: "u_" + Date.now(),
      sender: "user",
      text,
      time: timeNow,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputUrl("");
    setIsBotProcessing(true);

    // Bot typing & responding
    setTimeout(() => {
      const interimMsg: ChatBubble = {
        id: "b_load_" + Date.now(),
        sender: "bot",
        text: "⚡ Garment detected! Pulling high-res textures and fitting to your persistent avatar...",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, interimMsg]);

      setTimeout(() => {
        const finalMsg: ChatBubble = {
          id: "b_res_" + Date.now(),
          sender: "bot",
          text: "✨ Here is your completed try-on! Fabric drape and natural skin lighting preserved perfectly.",
          image: previewImg || "/images/look_brunch.png",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setIsBotProcessing(false);
        setMessages((prev) => [...prev, finalMsg]);
      }, 1600);
    }, 900);
  };

  const handleConnectPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;

    setIsSaving(true);
    try {
      if (onSavePhone) {
        await onSavePhone(phoneInput);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        className="glass-panel-luxury specular-top"
        style={{
          width: "100%",
          maxWidth: 680,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#25D366",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "0 2px 10px rgba(37, 211, 102, 0.4)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.311.045-.698.072-2.371-.62-1.415-.588-2.316-2.029-2.387-2.123-.07-.093-.578-.77-.578-1.467 0-.698.365-1.041.496-1.185.13-.144.286-.18.382-.18.096 0 .192.001.275.006.09.004.21-.034.329.251.125.298.428 1.042.466 1.119.038.077.064.168.013.272-.051.103-.076.168-.152.257-.076.09-.16.201-.229.27-.076.077-.156.161-.067.315.089.153.396.654.85 1.059.584.521 1.077.683 1.23.76.153.077.244.064.334-.038.09-.103.382-.446.484-.599.103-.153.205-.128.345-.077.14.051.888.419 1.041.496.153.076.255.115.293.18.038.064.038.371-.106.776zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.981-1.396A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text)" }}>
                WhatsApp Try-On Assistant
              </h3>
              <p style={{ fontSize: 11, color: "var(--text-soft)", margin: 0 }}>
                Instant AI Try-On on WhatsApp in under 60 seconds
              </p>
            </div>
          </div>

          {/* Tab Pill Switcher */}
          <div style={{ display: "flex", gap: 4, background: "var(--surface)", padding: 3, borderRadius: 99, border: "1px solid var(--border)" }}>
            <button
              type="button"
              onClick={() => setActiveTab("simulator")}
              style={{
                padding: "4px 12px",
                borderRadius: 99,
                border: "none",
                fontSize: 11,
                fontWeight: activeTab === "simulator" ? 700 : 500,
                background: activeTab === "simulator" ? "#25D366" : "transparent",
                color: activeTab === "simulator" ? "#fff" : "var(--text-soft)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Live Demo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("connect")}
              style={{
                padding: "4px 12px",
                borderRadius: 99,
                border: "none",
                fontSize: 11,
                fontWeight: activeTab === "connect" ? 700 : 500,
                background: activeTab === "connect" ? "#25D366" : "transparent",
                color: activeTab === "connect" ? "#fff" : "var(--text-soft)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Connect Number
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-soft)",
              fontSize: 18,
              cursor: "pointer",
              padding: 4,
              marginLeft: 10,
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
          {activeTab === "simulator" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Quick Sample Links Bar */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Try a 1-click sample product:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                  {SAMPLE_LINKS.map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => handleSendSimulatorMessage(sample.url, sample.img)}
                      disabled={isBotProcessing}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 99,
                        background: "rgba(37, 211, 102, 0.1)",
                        border: "1px solid rgba(37, 211, 102, 0.3)",
                        color: "#25D366",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      🔗 {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Chat Phone Frame */}
              <div
                style={{
                  background: "#0b141a",
                  borderRadius: "var(--r-md)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  height: 320,
                  overflow: "hidden",
                  boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)",
                }}
              >
                {/* Chat header */}
                <div style={{ padding: "8px 14px", background: "#202c33", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14 }}>
                    TF
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "#e9edef" }}>Threadflank Assistant ✓</div>
                    <div style={{ fontSize: 10, color: "#8696a0" }}>Official Verified Try-On Bot</div>
                  </div>
                </div>

                {/* Messages stream */}
                <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                        maxWidth: "80%",
                        background: m.sender === "user" ? "#005c4b" : "#202c33",
                        color: "#e9edef",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 12.5,
                        lineHeight: 1.45,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                      }}
                    >
                      {m.text && <p style={{ margin: 0 }}>{m.text}</p>}
                      {m.image && (
                        <div style={{ marginTop: 8, borderRadius: 6, overflow: "hidden", maxHeight: 180 }}>
                          <img src={m.image} alt="Try-on render" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      )}
                      <div style={{ fontSize: 9.5, color: "#8696a0", textAlign: "right", marginTop: 4 }}>
                        {m.time} {m.sender === "user" ? "✓✓" : ""}
                      </div>
                    </div>
                  ))}
                  {isBotProcessing && (
                    <div style={{ alignSelf: "flex-start", background: "#202c33", padding: "6px 12px", borderRadius: 8, fontSize: 11, color: "#8696a0" }}>
                      Assistant is typing...
                    </div>
                  )}
                </div>

                {/* Input bar */}
                <div style={{ padding: "8px 10px", background: "#202c33", display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Paste Myntra, Zara, or ASOS link..."
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendSimulatorMessage(inputUrl)}
                    style={{
                      flex: 1,
                      background: "#2a3942",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 12px",
                      color: "#fff",
                      fontSize: 12,
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSendSimulatorMessage(inputUrl)}
                    disabled={!inputUrl.trim() || isBotProcessing}
                    style={{
                      background: "#25D366",
                      border: "none",
                      borderRadius: 8,
                      padding: "0 14px",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                      opacity: !inputUrl.trim() || isBotProcessing ? 0.5 : 1,
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Connect Phone Tab */
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>
                  Link Your WhatsApp Number
                </h4>
                <p style={{ fontSize: 12.5, color: "var(--text-soft)", maxWidth: 420, margin: "0 auto" }}>
                  Save your mobile number so our WhatsApp bot recognizes your messages and automatically uses your saved digital twin.
                </p>
              </div>

              <form onSubmit={handleConnectPhone} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Phone Number (with Country Code)</label>
                  <input
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                  />
                </div>

                {savedSuccess && (
                  <p style={{ color: "#00c98d", fontSize: 12, margin: 0, fontWeight: 600 }}>
                    ✓ WhatsApp number linked successfully! You can now send garment links directly.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSaving || !phoneInput.trim()}
                  className="btn btn-gradient"
                  style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", borderColor: "#25D366" }}
                >
                  {isSaving ? "Saving..." : "Save & Activate WhatsApp Bot"}
                </button>
              </form>

              {/* Direct Open WhatsApp Link */}
              <div
                style={{
                  padding: 14,
                  borderRadius: "var(--r-md)",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: "var(--text)" }}>
                    Ready to chat on your phone?
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-soft)", margin: "2px 0 0" }}>
                    Scan QR code or click to launch WhatsApp directly.
                  </p>
                </div>
                <a
                  href="https://wa.me/919876543210?text=START%20TRYON"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm"
                  style={{
                    background: "#25D366",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 700,
                    borderRadius: 99,
                    padding: "8px 16px",
                  }}
                >
                  Open WhatsApp ↗
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
