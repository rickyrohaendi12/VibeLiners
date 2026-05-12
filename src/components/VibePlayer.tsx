import React, { useState, useEffect, useRef } from "react";
import { useVibe } from "../context/VibeContext";
import { DUMMY_SONGS } from "../constants";
import { Song } from "../types";
import { parseVibeFromMood } from "../services/vibeService";
import { fetchRecommendedSongs } from "../services/recommendationService";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Sparkles,
  Send,
  Music2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import logo from "../images/VibeLiners.png";

export const VibePlayer: React.FC = () => {
  const { currentVibe, setVibe } = useVibe();
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [moodInput, setMoodInput] = useState("");
  const [liveRecommendation, setLiveRecommendation] = useState("Chill");
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFetchingRecommendations, setIsFetchingRecommendations] =
    useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSong = DUMMY_SONGS[currentSongIndex];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const getLiveRecommendation = (text: string) => {
    const value = text.trim().toLowerCase();
    if (!value) return "Chill";
    if (
      value.includes("rnb") ||
      value.includes("r&b") ||
      value.includes("soul") ||
      value.includes("smooth") ||
      value.includes("mellow")
    )
      return "RNB";
    if (
      value.includes("rock") ||
      value.includes("guitar") ||
      value.includes("heavy") ||
      value.includes("distortion") ||
      value.includes("loud")
    )
      return "Rock";
    if (
      value.includes("cyber") ||
      value.includes("vapor") ||
      value.includes("future") ||
      value.includes("digital") ||
      value.includes("neon")
    )
      return "Cyberpunk";
    if (
      value.includes("noir") ||
      value.includes("jazz") ||
      value.includes("smoke") ||
      value.includes("rain") ||
      value.includes("midnight")
    )
      return "Noir";
    if (
      value.includes("chill") ||
      value.includes("relax") ||
      value.includes("calm") ||
      value.includes("lofi")
    )
      return "Chill";
    return "Chill";
  };

  const handleMoodChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMoodInput(e.target.value);
    setLiveRecommendation(getLiveRecommendation(e.target.value));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Auto-switch vibe when song changes
  useEffect(() => {
    setVibe(currentSong.vibe);
    setCurrentTime(0);
    setDuration(0);
  }, [currentSongIndex, setVibe, currentSong.vibe]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateDuration = () => setDuration(audio.duration || 0);
    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentSongIndex((prev) => (prev + 1) % DUMMY_SONGS.length);
      setIsPlaying(true);
    };

    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentSongIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = currentSong.audioUrl;
    audio.load();

    if (isPlaying) {
      audio.play().catch((error) => {
        console.warn("Audio play failed:", error);
      });
    } else {
      audio.pause();
    }
  }, [currentSong.audioUrl, isPlaying, currentSong]);

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moodInput.trim() || isAnalyzing || isFetchingRecommendations) return;

    setIsAnalyzing(true);
    setIsFetchingRecommendations(true);

    const suggestedVibe = await parseVibeFromMood(moodInput);
    setVibe(suggestedVibe);

    const songs = await fetchRecommendedSongs(suggestedVibe);
    setRecommendedSongs(songs);

    setIsAnalyzing(false);
    setIsFetchingRecommendations(false);
    setMoodInput("");
  };

  const nextSong = () => {
    setCurrentSongIndex((prev) => (prev + 1) % DUMMY_SONGS.length);
    setIsPlaying(true);
  };

  const prevSong = () => {
    setCurrentSongIndex(
      (prev) => (prev - 1 + DUMMY_SONGS.length) % DUMMY_SONGS.length,
    );
    setIsPlaying(true);
  };

  const getAlbumArtClass = () => {
    if (currentVibe === "Rock")
      return "shake-anim shadow-[0_0_50px_rgba(255,0,0,0.4)]";
    if (currentVibe === "Chill")
      return "rounded-[40px] shadow-[0_20px_40px_rgba(0,0,0,0.1)]";
    if (currentVibe === "Cyberpunk")
      return "border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,242,255,0.6)]";
    if (currentVibe === "Noir") return "grayscale contrast-125";
    return "rounded-xl shadow-2xl";
  };

  return (
    <div className="h-full flex flex-col overflow-hidden text-[var(--vibe-text)]">
      <audio ref={audioRef} preload="metadata" className="hidden" />
      {/* Header Navigation */}
      <header className="flex items-center justify-between px-10 h-20 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <img src={logo} alt="VibeLiners Logo" className="w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tighter uppercase">
            VIBELINERS
          </h1>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[var(--vibe-primary)] animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--vibe-primary)]">
              Vibe: {currentVibe}
            </span>
          </div>
          <nav className="hidden md:flex gap-6 text-xs font-medium text-white/50 uppercase tracking-widest">
            <a href="#" className="text-white">
              Explore
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Library
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Studios
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 min-h-0 h-full grid grid-cols-12 gap-0 overflow-hidden">
        {/* Left Column: Playlist */}
        <aside className="hidden lg:flex col-span-3 border-r border-white/10 p-8 flex-col overflow-y-auto min-h-0 h-full theme-scrollbar">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6 font-mono">
            Active Sequence
          </h2>
          <div className="space-y-2">
            {DUMMY_SONGS.map((song, idx) => (
              <div
                key={song.id}
                onClick={() => {
                  setCurrentSongIndex(idx);
                  setIsPlaying(true);
                }}
                className={`p-4 cursor-pointer transition-all border-l-2 flex items-center gap-4 group ${
                  currentSongIndex === idx
                    ? "bg-white/5 border-[var(--vibe-primary)]"
                    : "hover:bg-white/5 border-transparent"
                }`}
              >
                <div
                  className={`text-xs font-mono ${currentSongIndex === idx ? "text-[var(--vibe-primary)]" : "text-white/30"}`}
                >
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div>
                  <div
                    className={`text-sm font-medium ${currentSongIndex === idx ? "text-white" : "text-white/70"}`}
                  >
                    {song.title}
                  </div>
                  <div className="text-xs text-white/40">{song.artist}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center Column: Visualizer/Artwork */}
        <section className="col-span-12 lg:col-span-6 flex flex-col items-center justify-center relative p-8 h-full min-h-0">
          {/* Main Album Art */}
          <div
            className="relative z-10 w-full max-w-[420px] aspect-square bg-[#121216] border border-white/10 shadow-2xl overflow-hidden group"
            style={{ borderRadius: "var(--vibe-radius)" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSong.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                className="w-full h-full relative"
              >
                <img
                  src={currentSong.albumArt}
                  alt={currentSong.title}
                  className={`w-full h-full object-cover transition-all duration-700 ${getAlbumArtClass()}`}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute inset-0 border-[20px] border-white/5 pointer-events-none"></div>

                <div className="absolute bottom-8 left-8">
                  <div
                    className={`text-4xl font-bold tracking-tight mb-2 uppercase ${currentVibe === "Cyberpunk" ? "glitch-text" : ""}`}
                  >
                    {currentSong.title.split(" ").join("\n")}
                  </div>
                  <div className="text-[var(--vibe-primary)] text-xs font-mono uppercase tracking-widest opacity-80">
                    ST_ID: {currentSong.id}-00X
                  </div>
                </div>

                {/* Cyberpunk Decorative Elements */}
                {currentVibe === "Cyberpunk" && (
                  <>
                    <div className="absolute top-4 right-4 w-12 h-[2px] bg-[#ff00ff]"></div>
                    <div className="absolute top-6 right-4 w-8 h-[2px] bg-[#00f3ff]"></div>
                  </>
                )}

                {/* Visualizer overlay */}
                {isPlaying && (
                  <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center items-end gap-1 h-32 pointer-events-none overflow-hidden">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-[var(--vibe-primary)] opacity-40"
                        animate={{
                          height: [10, Math.random() * 60 + 10, 10],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: Math.random() * 0.4 + 0.3,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Song Progress Info */}
          <div className="mt-12 w-full max-w-[420px] flex flex-col items-center">
            <div className="flex justify-between w-full mb-4 px-2">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                {formatTime(currentTime)}/{" "}
                {duration > 0 ? formatTime(duration) : currentSong.duration}
              </div>
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                BPM: 124
              </div>
            </div>
            <div className="w-full h-[2px] bg-white/10 relative">
              <motion.div
                className="absolute h-full bg-[var(--vibe-primary)] shadow-[0_0_10px_var(--vibe-primary)]"
                initial={false}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        {/* Right Column: Liners Engine */}
        <aside className="hidden lg:flex col-span-3 border-l border-white/10 p-8 flex-col bg-white/[0.02] overflow-hidden min-h-0 h-full">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6 font-mono">
            Vibe Liners Engine
          </h2>
          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-0 theme-scrollbar">
            <form onSubmit={handleMoodSubmit} className="mb-6 space-y-4">
              <div>
                <label className="text-[10px] font-mono text-[var(--vibe-primary)] mb-2 block uppercase tracking-widest">
                  Input Current Mood
                </label>
                <textarea
                  value={moodInput}
                  onChange={handleMoodChange}
                  placeholder="e.g. Sad night in Tokyo..."
                  className="w-full bg-black/40 border border-white/10 p-4 min-h-[140px] text-sm italic text-white/70 leading-relaxed outline-none focus:border-[var(--vibe-primary)] transition-colors resize-none font-sans"
                />
                <div className="mt-3 text-[10px] uppercase tracking-[0.3em] text-white/40">
                  Recommended vibe:{" "}
                  <span className="text-[var(--vibe-primary)]">
                    {liveRecommendation}
                  </span>
                </div>
              </div>
              <button
                type="submit"
                disabled={isAnalyzing || !moodInput.trim()}
                className="w-full py-4 bg-white text-black font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--vibe-primary)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Apply Vibe Shift <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </form>

            {isFetchingRecommendations && (
              <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl text-[10px] uppercase tracking-[0.3em] text-white/40">
                Searching for songs that match your vibe...
              </div>
            )}

            {recommendedSongs.length > 0 && (
              <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 font-mono">
                  Recommended Songs
                </div>
                <div className="space-y-3">
                  {recommendedSongs.map((song) => (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => {
                        const index = DUMMY_SONGS.findIndex(
                          (item) => item.id === song.id,
                        );
                        if (index >= 0) {
                          setCurrentSongIndex(index);
                          setIsPlaying(true);
                        }
                      }}
                      className="w-full flex items-center justify-between gap-4 p-3 bg-black/20 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {song.title}
                        </div>
                        <div className="text-[10px] text-white/40 uppercase tracking-[0.2em]">
                          {song.artist}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--vibe-primary)]">
                          {song.vibe}
                        </span>
                        <Music2 className="w-4 h-4 text-[var(--vibe-primary)]" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-[10px] font-mono text-white/40 mb-3 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-[var(--vibe-primary)]" />{" "}
                  System Recommendation
                </div>
                <div className="text-sm font-bold text-white mb-1 uppercase tracking-tight">
                  {currentVibe} PROTOCOL
                </div>
                <div className="text-[10px] text-white/50 leading-relaxed uppercase tracking-tighter">
                  Analyzing acoustic signatures... Derived atmosphere:{" "}
                  {currentVibe === "Cyberpunk"
                    ? "High contrast digital textures"
                    : "Ambient harmonic resonance"}
                  .
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex justify-between items-center py-4 border-t border-white/10">
              <span className="text-[10px] text-white/30 uppercase tracking-widest">
                System Status
              </span>
              <span className="text-[10px] text-[var(--vibe-primary)] font-mono animate-pulse">
                SYNCED
              </span>
            </div>
          </div>
        </aside>
      </main>

      {/* Player Controls Footer */}
      <footer className="h-24 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center px-10 shrink-0">
        <div className="flex-1 flex items-center gap-6">
          <div
            className="w-12 h-12 bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden"
            style={{ borderRadius: "calc(var(--vibe-radius)/2)" }}
          >
            <img
              src={currentSong.albumArt}
              className="w-full h-full object-cover opacity-60"
            />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">
              {currentSong.title}
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-[0.2em]">
              {currentSong.artist}
            </div>
          </div>
        </div>

        <div className="flex-1 flex justify-center items-center gap-10">
          <button
            onClick={prevSong}
            className="text-white/40 hover:text-white transition-colors"
          >
            <SkipBack className="w-6 h-6" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            )}
          </button>
          <button
            onClick={nextSong}
            className="text-white/40 hover:text-white transition-colors"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 hidden md:flex justify-end items-center gap-8">
          <div className="flex items-center gap-4 text-white/40">
            <div className="w-24 h-[1px] bg-white/10 relative">
              <div className="absolute h-full bg-white/60 w-3/4"></div>
            </div>
          </div>
          <button className="px-4 py-2 border border-white/10 text-white/40 text-[10px] uppercase font-bold tracking-widest hover:border-white transition-colors">
            Visualizer
          </button>
        </div>
      </footer>
    </div>
  );
};
