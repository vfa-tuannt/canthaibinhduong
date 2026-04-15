/**
 * Authentication module.
 * Credentials are stored in ScriptProperties (AUTH_USERNAME, AUTH_PASSWORD).
 * Sessions are stored in ScriptProperties with 7-day TTL.
 */

interface LoginResult {
  success: boolean;
  token?: string;
  error?: string;
}

interface SessionData {
  username: string;
  expiresAt: number;
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const SESSION_PREFIX = "SESSION_";

function login(username: string, password: string): LoginResult {
  const props = PropertiesService.getScriptProperties();
  const expectedUser = props.getProperty("AUTH_USERNAME");
  const expectedPass = props.getProperty("AUTH_PASSWORD");

  if (!expectedUser || !expectedPass) {
    console.error("login: AUTH_USERNAME or AUTH_PASSWORD not set in ScriptProperties");
    return { success: false, error: "Hệ thống chưa được cấu hình. Liên hệ quản trị viên." };
  }

  if (username !== expectedUser || password !== expectedPass) {
    console.log(`login: failed attempt for username="${username}"`);
    return { success: false, error: "Tên đăng nhập hoặc mật khẩu không đúng." };
  }

  const token = Utilities.getUuid();
  const sessionData: SessionData = {
    username,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  props.setProperty(SESSION_PREFIX + token, JSON.stringify(sessionData));
  console.log(`login: success for username="${username}", token generated, expires in 7 days`);
  return { success: true, token };
}

function validateSession(token: string): boolean {
  if (!token) return false;
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty(SESSION_PREFIX + token);
  if (!raw) {
    console.log(`validateSession: token=${token.substring(0, 8)}… valid=false (not found)`);
    return false;
  }
  const session: SessionData = JSON.parse(raw);
  if (Date.now() > session.expiresAt) {
    props.deleteProperty(SESSION_PREFIX + token);
    console.log(`validateSession: token=${token.substring(0, 8)}… valid=false (expired)`);
    return false;
  }
  console.log(`validateSession: token=${token.substring(0, 8)}… valid=true`);
  return true;
}

function logout(token: string): void {
  if (!token) return;
  PropertiesService.getScriptProperties().deleteProperty(SESSION_PREFIX + token);
  console.log(`logout: token=${token.substring(0, 8)}… removed`);
}

export { login, validateSession, logout, LoginResult };
