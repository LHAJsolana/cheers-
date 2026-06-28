import assert from "node:assert/strict";
import test from "node:test";
import { isSessionExpired, sessionExpiresAt } from "../src/lib/session-rules";

test("expires sessions three hours after the last drink", () => {
  const lastDrink = new Date("2026-06-22T20:00:00.000Z");

  assert.equal(sessionExpiresAt(lastDrink).toISOString(), "2026-06-22T23:00:00.000Z");
  assert.equal(isSessionExpired(lastDrink, new Date("2026-06-22T22:59:59.999Z")), false);
  assert.equal(isSessionExpired(lastDrink, new Date("2026-06-22T23:00:00.000Z")), true);
});
