import assert from "node:assert/strict";
import test from "node:test";
import { buildStartTimerMutations } from "../src/lib/timer-logic";

test("starting a timer stops existing running entries", () => {
  const now = new Date("2026-02-20T10:00:00.000Z");

  const result = buildStartTimerMutations(
    [
      { id: "a", startTs: new Date("2026-02-20T09:00:00.000Z"), endTs: null },
      { id: "b", startTs: new Date("2026-02-20T09:30:00.000Z"), endTs: null },
    ],
    now,
    0,
  );

  assert.deepEqual(result.entriesToStop.sort(), ["a", "b"]);
  assert.equal(result.stopAt.toISOString(), now.toISOString());
});

test("rounding is applied when auto-stopping on timer start", () => {
  const now = new Date("2026-02-20T10:07:00.000Z");

  const result = buildStartTimerMutations(
    [{ id: "running", startTs: new Date("2026-02-20T09:00:00.000Z"), endTs: null }],
    now,
    5,
  );

  assert.equal(result.stopAt.toISOString(), "2026-02-20T10:05:00.000Z");
});



