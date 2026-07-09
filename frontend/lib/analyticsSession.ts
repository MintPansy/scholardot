import type { ReadEntrySource } from "./analytics";

const READ_ENTRY_SOURCE_KEY = "analyticsReadSource";

export function markReadEntrySource(
  source: Exclude<ReadEntrySource, "session">
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(READ_ENTRY_SOURCE_KEY, source);
}

export function consumeReadEntrySource(): ReadEntrySource {
  if (typeof window === "undefined") return "session";
  const value = sessionStorage.getItem(READ_ENTRY_SOURCE_KEY);
  sessionStorage.removeItem(READ_ENTRY_SOURCE_KEY);
  if (value === "newdocument" || value === "library" || value === "demo") {
    return value;
  }
  return "session";
}
