const TERMINAL_CRED_KEY = "terminal_cred";

export function setTerminalCredentials(email: string, password: string) {
  sessionStorage.setItem(TERMINAL_CRED_KEY, JSON.stringify({ email, password }));
}

export function getTerminalCredentials(): { email: string; password: string } | null {
  const raw = sessionStorage.getItem(TERMINAL_CRED_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearTerminalCredentials() {
  sessionStorage.removeItem(TERMINAL_CRED_KEY);
}
