import React from "react";

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(255,255,255,0.7)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const spinnerContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const spinnerStyle: React.CSSProperties = {
  width: "64px",
  height: "64px",
  border: "8px solid #e5e7eb",
  borderTop: "8px solid #6366f1",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  marginBottom: "16px",
};

const dotsStyle: React.CSSProperties = {
  display: "flex",
  gap: "4px",
  marginBottom: "8px",
};

const dotStyle: React.CSSProperties = {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  background: "#6366f1",
  opacity: 0.5,
  animation: "pulse 1.2s infinite",
};

type LoaderProps = {
  message?: string;
};

const Loader: React.FC<LoaderProps> = ({ message }) => (
  <div style={overlayStyle}>
    <div style={spinnerContainerStyle}>
      <div style={spinnerStyle} />
      <div style={dotsStyle}>
        <span style={{ ...dotStyle, animationDelay: "0s" }} />
        <span style={{ ...dotStyle, animationDelay: "0.3s" }} />
        <span style={{ ...dotStyle, animationDelay: "0.6s" }} />
      </div>
      {message && (
        <div style={{ color: "#374151", fontSize: "1.1rem", textAlign: "center", marginTop: 8 }}>
          {message}
        </div>
      )}
    </div>
    <style>
      {`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.5; transform: scale(1); }
          40% { opacity: 1; transform: scale(1.3); }
        }
      `}
    </style>
  </div>
);

export default Loader;