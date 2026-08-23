"use client";
import { useEffect, useRef, useState } from "react";

interface ReadyPlayerMeCreatorProps {
  onAvatarCreated: (avatarUrl: string) => void;
  onClose: () => void;
}

const SUBDOMAIN = "demo"; // RPM app subdomain

export function ReadyPlayerMeCreator({ onAvatarCreated, onClose }: ReadyPlayerMeCreatorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Ready Player Me sends JSON string messages
      const json = parse(event);
      if (!json) return;

      if (json.source !== "readyplayerme") return;

      if (json.eventName === "v1.frame.ready") {
        // Send the configuration to the iframe
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            target: "readyplayerme",
            type: "subscribe",
            eventName: "v1.**",
          }),
          "*"
        );
      }

      if (json.eventName === "v1.avatar.exported") {
        // Avatar URL received — e.g. https://models.readyplayer.me/xxxxxx.glb
        onAvatarCreated(json.data.url);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onAvatarCreated]);

  function parse(event: MessageEvent) {
    try {
      return JSON.parse(event.data);
    } catch {
      return null;
    }
  }

  return (
    <div className="rpm-overlay">
      <div className="rpm-modal">
        {/* Header */}
        <div className="rpm-modal-header">
          <div className="rpm-modal-title">
            <span className="rpm-badge">3D</span>
            Create Your Avatar
          </div>
          <p className="rpm-modal-sub">
            Customise your face, body, hair &amp; style — then hit <strong>Done</strong>
          </p>
          <button className="rpm-close-btn" onClick={onClose} title="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* iFrame */}
        <div className="rpm-iframe-wrap">
          {isLoading && (
            <div className="rpm-loading">
              <div className="rpm-spinner" />
              <p>Loading avatar creator…</p>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={`https://${SUBDOMAIN}.readyplayer.me/avatar?frameApi&clearCache`}
            allow="camera *; microphone *; clipboard-write"
            className="rpm-iframe"
            onLoad={() => setIsLoading(false)}
            title="Ready Player Me avatar creator"
          />
        </div>
      </div>
    </div>
  );
}
