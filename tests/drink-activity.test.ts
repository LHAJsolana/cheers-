import assert from "node:assert/strict";
import test from "node:test";
import { ActivityType } from "@prisma/client";
import { drinkActivityRecords } from "../src/lib/drink-activity";

test("creates drink, session, and check-in activity records for a first checked-in drink", () => {
  const records = drinkActivityRecords({
    user: { id: "user_1", name: "Maya" },
    drinkLog: { id: "drink_1", location: "Sky Bar" },
    session: { id: "session_1", title: "Friday Night" },
    message: "Maya logged a spritz.",
    isFirstSessionDrink: true,
    checkIn: true,
  });

  assert.deepEqual(records.map((record) => record.type), [
    ActivityType.DRINK_LOGGED,
    ActivityType.SESSION_STARTED,
    ActivityType.CHECK_IN,
  ]);
  assert.equal(records[0].message, "Maya logged a spritz.");
  assert.equal(records[1].message, "Maya started Friday Night.");
  assert.equal(records[2].message, "Maya checked in at Sky Bar.");
});
