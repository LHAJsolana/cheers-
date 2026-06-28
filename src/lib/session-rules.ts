export const SESSION_GAP_HOURS = 3;

export function sessionExpiresAt(lastDrinkAt: Date) {
  return new Date(lastDrinkAt.getTime() + SESSION_GAP_HOURS * 60 * 60 * 1000);
}

export function isSessionExpired(lastDrinkAt: Date, now = new Date()) {
  return now.getTime() >= sessionExpiresAt(lastDrinkAt).getTime();
}
