import { DUMMY_SONGS } from "../constants";
import { Song } from "../types";

const normalizeVibe = (vibe: string) => vibe.trim().toLowerCase();

export async function fetchRecommendedSongs(vibe: string): Promise<Song[]> {
  const normalized = normalizeVibe(vibe);

  const matchedSongs = DUMMY_SONGS.filter(
    (song) => song.vibe.toLowerCase() === normalized,
  );

  if (matchedSongs.length > 0) {
    return new Promise((resolve) =>
      setTimeout(() => resolve(matchedSongs), 250),
    );
  }

  if (normalized === "rnb" || normalized === "r&b") {
    return new Promise((resolve) =>
      setTimeout(
        () => resolve(DUMMY_SONGS.filter((song) => song.vibe === "Chill")),
        250,
      ),
    );
  }

  return new Promise((resolve) =>
    setTimeout(
      () => resolve(DUMMY_SONGS.filter((song) => song.vibe === "Chill")),
      250,
    ),
  );
}
