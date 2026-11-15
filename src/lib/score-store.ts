"use client";

import { useSyncExternalStore } from "react";
import type { Player } from "@/lib/game";

export type Score = Record<Player | "draw", number>;

const KEY = "tic-tac-toe:score";
export const ZERO_SCORE: Score = { X: 0, O: 0, draw: 0 };

let cache: Score | null = null;
const listeners = new Set<() => void>();

function isScore(value: unknown): value is Score {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return [v.X, v.O, v.draw].every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0);
}

function read(): Score {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null");
    cache = isScore(parsed) ? parsed : ZERO_SCORE;
  } catch {
    cache = ZERO_SCORE;
  }
  return cache;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function updateScore(update: (score: Score) => Score) {
  cache = update(read());
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Storage unavailable (private mode, blocked): keep the in-memory score.
  }
  listeners.forEach((l) => l());
}

/** Scoreboard persisted to localStorage; renders zeros on the server. */
export function useScore(): Score {
  return useSyncExternalStore(subscribe, read, () => ZERO_SCORE);
}
