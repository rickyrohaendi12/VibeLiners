import React, { useMemo } from "react";
import { useVibe } from "../context/VibeContext";
import { motion, AnimatePresence } from "motion/react";

interface ThemeWrapperProps {
  children: React.ReactNode;
}

const THEMES = {
  Rock: {
    primary: "#ff3131",
    bg: "#08080b",
    accent: "#8b0000",
    radius: "0px",
    text: "#ffffff",
    font: '"Space Grotesk", sans-serif',
    gradient: "radial-gradient(circle at center, #1a0000 0%, #08080b 100%)",
  },
  Chill: {
    primary: "#00f3ff", // Cyber-infusion for "sophistication"
    bg: "#08080b",
    accent: "#457b9d",
    radius: "24px",
    text: "#ffffff",
    font: '"Outfit", sans-serif',
    gradient: "radial-gradient(circle at top right, #002233 0%, #08080b 100%)",
  },
  Cyberpunk: {
    primary: "#00f3ff",
    bg: "#08080b",
    accent: "#ff00ff",
    radius: "4px",
    text: "#ffffff",
    font: '"JetBrains Mono", monospace',
    gradient: "linear-gradient(45deg, #0d0221 0%, #08080b 100%)",
  },
  Noir: {
    primary: "#ffffff",
    bg: "#08080b",
    accent: "#333333",
    radius: "2px",
    text: "#e0e0e0",
    font: '"Playfair Display", serif',
    gradient: "radial-gradient(circle at bottom, #1a1a1a 0%, #08080b 100%)",
  },
  Default: {
    primary: "#00f3ff",
    bg: "#08080b",
    accent: "#3b82f6",
    radius: "12px",
    text: "#ffffff",
    font: '"Inter", sans-serif',
    gradient: "linear-gradient(180deg, #08080b 0%, #000000 100%)",
  },
};

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const { currentVibe } = useVibe();
  const theme = THEMES[currentVibe] || THEMES.Default;

  const styleVariables = useMemo(() => {
    return {
      "--vibe-primary": theme.primary,
      "--vibe-bg": theme.bg,
      "--vibe-accent": theme.accent,
      "--vibe-radius": theme.radius,
      "--vibe-text": theme.text,
      fontFamily: theme.font,
    } as React.CSSProperties;
  }, [theme]);

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden transition-colors duration-1000"
      style={{ ...styleVariables, backgroundColor: theme.bg }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentVibe}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: theme.gradient }}
        />
      </AnimatePresence>

      {/* Atmospheric Effects */}
      {currentVibe === "Chill" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-200/20 blur-[120px] breathe-anim" />
          <div
            className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-pink-200/20 blur-[120px] breathe-anim"
            style={{ animationDelay: "2s" }}
          />
        </div>
      )}

      {currentVibe === "Cyberpunk" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="grid grid-cols-12 h-full w-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-cyan-500/30" />
            ))}
          </div>
        </div>
      )}

      <div className="relative z-10 h-screen flex flex-col">{children}</div>
    </div>
  );
};
