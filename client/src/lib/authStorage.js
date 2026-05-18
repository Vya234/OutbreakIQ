const TOKEN_KEY = 'outbreakiq_admin_token';
const EMAIL_KEY = 'outbreakiq_admin_email';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredEmail() {
  return localStorage.getItem(EMAIL_KEY);
}

export function setStoredAuth(token, email) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, email);
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
}
