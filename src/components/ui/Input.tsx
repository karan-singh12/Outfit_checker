import React from "react";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  onClear?: () => void;
  label?: string;
  error?: string;
}

export default function Input({
  value,
  onChange,
  icon,
  onClear,
  label,
  error,
  className = "",
  placeholder,
  ...props
}: InputProps) {
  return (
    <div className="ss-input-wrapper">
      {label && <label className="ss-input-label">{label}</label>}
      <div className="ss-input-field-container">
        {icon && <div className="ss-input-icon">{icon}</div>}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`ss-input ${icon ? "has-icon" : ""} ${onClear && value ? "has-clear" : ""} ${error ? "has-error" : ""} ${className}`}
          {...props}
        />
        {onClear && value && (
          <button
            type="button"
            onClick={onClear}
            className="ss-input-clear-btn"
            aria-label="Clear input"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {error && <span className="ss-input-error-msg">{error}</span>}
    </div>
  );
}
