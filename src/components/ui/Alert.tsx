import React from "react";

export interface AlertProps {
  type?: "warning" | "error" | "info" | "success";
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export default function Alert({
  type = "info",
  title,
  message,
  actionText,
  onAction,
  className = "",
}: AlertProps) {
  return (
    <div className={`ss-alert ss-alert-${type} ${className}`} role="alert">
      <div className="ss-alert-content">
        <div className="ss-alert-icon">
          {type === "error" && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          {type === "warning" && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )}
          {type === "success" && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )}
          {type === "info" && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          )}
        </div>
        <div className="ss-alert-body">
          <h4 className="ss-alert-title">{title}</h4>
          <p className="ss-alert-msg">{message}</p>
        </div>
      </div>
      {actionText && onAction && (
        <button type="button" onClick={onAction} className="ss-alert-action-btn">
          {actionText}
        </button>
      )}
    </div>
  );
}
