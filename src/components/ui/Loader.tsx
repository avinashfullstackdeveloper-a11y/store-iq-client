import React from "react";

const Loader: React.FC<{
  message?: string;
  size?: "small" | "medium" | "large";
  variant?: "spinner" | "dots" | "pulse";
  overlayColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
}> = ({ 
  message = "Loading...", 
  size = "medium",
  variant = "spinner",
  overlayColor = "rgba(255, 255, 255, 0.9)",
  primaryColor = "#6366f1",
  secondaryColor = "#e5e7eb"
}) => {
  // Size configurations
  const sizeConfig = {
    small: { spinner: 32, dot: 6, fontSize: "0.9rem" },
    medium: { spinner: 64, dot: 10, fontSize: "1.1rem" },
    large: { spinner: 96, dot: 14, fontSize: "1.3rem" }
  };

  const currentSize = sizeConfig[size];

  // Overlay style
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: overlayColor,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
  };

  // Spinner style
  const spinnerStyle: React.CSSProperties = {
    width: `${currentSize.spinner}px`,
    height: `${currentSize.spinner}px`,
    border: `8px solid ${secondaryColor}`,
    borderTop: `8px solid ${primaryColor}`,
    borderRadius: "50%",
    animation: "spin 1.2s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite",
    marginBottom: "16px",
  };

  // Dots style
  const dotsStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
  };

  const dotStyle: React.CSSProperties = {
    width: `${currentSize.dot}px`,
    height: `${currentSize.dot}px`,
    borderRadius: "50%",
    background: primaryColor,
    opacity: 0.6,
    animation: "pulse 1.4s ease-in-out infinite both",
  };

  // Pulse style (alternative to spinner)
  const pulseStyle: React.CSSProperties = {
    width: `${currentSize.spinner}px`,
    height: `${currentSize.spinner}px`,
    borderRadius: "50%",
    background: primaryColor,
    marginBottom: "16px",
    animation: "scaleInOut 1.5s ease-in-out infinite both",
    boxShadow: `0 0 20px ${primaryColor}20`,
  };

  return (
    <div style={overlayStyle}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {variant === "spinner" && <div style={spinnerStyle} />}
        {variant === "dots" && (
          <div style={dotsStyle}>
            <span style={{ ...dotStyle, animationDelay: "0s" }} />
            <span style={{ ...dotStyle, animationDelay: "0.2s" }} />
            <span style={{ ...dotStyle, animationDelay: "0.4s" }} />
          </div>
        )}
        {variant === "pulse" && <div style={pulseStyle} />}
        
        {message && (
          <div style={{ 
            color: "#374151", 
            fontSize: currentSize.fontSize, 
            textAlign: "center",
            marginTop: "12px",
            fontWeight: 500,
            maxWidth: "300px",
            lineHeight: 1.4
          }}>
            {message}
          </div>
        )}
      </div>
      
      <style>
        {`
          @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
          }
          
          @keyframes pulse {
            0%, 80%, 100% { 
              opacity: 0.6; 
              transform: scale(1); 
            }
            40% { 
              opacity: 1; 
              transform: scale(1.2); 
            }
          }
          
          @keyframes scaleInOut {
            0% { 
              transform: scale(0.9);
              opacity: 0.7;
            }
            50% { 
              transform: scale(1.1);
              opacity: 1;
            }
            100% { 
              transform: scale(0.9);
              opacity: 0.7;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Loader;