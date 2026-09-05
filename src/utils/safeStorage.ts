// localStorage.setItem can throw (quota exceeded, private-browsing restrictions, etc.).
// Since these writes happen inside effects/render paths with no error boundary in this
// app, an uncaught throw here blanks the entire screen. Swallow and log instead.
export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to save "${key}" to localStorage`, error);
  }
}
