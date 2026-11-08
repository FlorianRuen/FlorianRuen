/**
 * Waveform of the Europe 1 interview: 80 loudness values (RMS, scaled 18–100)
 * computed from the MP3 with ffmpeg, so the player can draw the waves without
 * downloading the audio. The MP3 itself is not in the repo, see AUDIO_URL.
 */
export const EUROPE1_PEAKS = [
  94, 94, 91, 70, 82, 68, 67, 64, 63, 76, 51, 64, 68, 68, 84, 75, 77, 71, 55,
  45, 48, 80, 58, 51, 39, 45, 45, 51, 66, 67, 52, 40, 45, 49, 48, 70, 75, 69,
  63, 89, 81, 74, 68, 99, 65, 84, 97, 99, 66, 84, 51, 83, 96, 73, 42, 38, 58,
  68, 79, 65, 83, 73, 74, 94, 82, 84, 57, 18, 46, 48, 91, 77, 79, 74, 52, 58,
  70, 87, 64, 100,
] as const;
