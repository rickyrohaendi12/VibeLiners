export type VibeType = "Rock" | "Chill" | "Cyberpunk" | "Noir" | "Default";

export interface VibeTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  radius: string;
  font: string;
  blur: string;
  animation: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  vibe: VibeType;
  duration: string;
  audioUrl: string;
}
