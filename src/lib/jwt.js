// JWT는 서명 검증 없이 페이로드만 읽는다(표시/분기용). 서명 검증은 서버가 이미 했다.
export const decodeJwtPayload = (bearerToken) => {
  if (!bearerToken) return null;
  try {
    const jwt = bearerToken.replace(/^Bearer\s+/, '');
    const payload = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};
