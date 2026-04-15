/**
 * Authentication module.
 * Credentials are stored in ScriptProperties (AUTH_USERNAME, AUTH_PASSWORD).
 * Sessions are stored in CacheService with 6-hour TTL.
 */

interface LoginResult {
  success: boolean;
  token?: string;
  error?: string;
}

const SESSION_TTL = 21600; // 6 hours in seconds

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
  CacheService.getUserCache()!.put(token, username, SESSION_TTL);
  console.log(`login: success for username="${username}", token generated`);
  return { success: true, token };
}

function validateSession(token: string): boolean {
  if (!token) return false;
  const cached = CacheService.getUserCache()!.get(token);
  const valid = cached !== null;
  console.log(`validateSession: token=${token.substring(0, 8)}… valid=${valid}`);
  return valid;
}

function logout(token: string): void {
  if (!token) return;
  CacheService.getUserCache()!.remove(token);
  console.log(`logout: token=${token.substring(0, 8)}… removed`);
}

export { login, validateSession, logout, LoginResult };
