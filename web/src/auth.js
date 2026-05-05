const API_BASE = "http://localhost:8080";
const TOKEN_KEY = "vt_token";
const USERNAME_KEY = "username";

export async function login(email, password) {
  try {
    const res = await fetch(`${API_BASE}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: text || "Invalid email or password." };
    }

    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USERNAME_KEY, data.username);
    return { ok: true };

  } catch {
    return { ok: false, error: "Server error. Please try again." };
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}


export function getUsername() {
  return localStorage.getItem(USERNAME_KEY);
}

export function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export async function authFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
}