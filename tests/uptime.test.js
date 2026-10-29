import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { UptimeTracker } from "../src/uptime.js";

test("reports fully available time since monitoring starts", async () => {
  const directory = await mkdtemp(join(tmpdir(), "discord-uptime-"));
  let now = 10_000;
  const tracker = new UptimeTracker({
    filePath: join(directory, "uptime.json"),
    sampleIntervalMs: 1_000,
    now: () => now,
  });

  try {
    await tracker.load();
    await tracker.start();
    now += 500;
    const summary = tracker.getSummary();

    assert.equal(summary.percentage, 100);
    assert.equal(summary.observedMs, 500);
    assert.equal(summary.upMs, 500);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("counts a delayed heartbeat as downtime", async () => {
  const directory = await mkdtemp(join(tmpdir(), "discord-uptime-"));
  let now = 20_000;
  const filePath = join(directory, "uptime.json");
  const options = {
    filePath,
    sampleIntervalMs: 1_000,
    now: () => now,
  };

  try {
    const tracker = new UptimeTracker(options);
    await tracker.load();
    await tracker.start();
    now += 1_000;
    await tracker.record(true);
    now += 3_000;
    await tracker.record(true);

    const summary = tracker.getSummary();
    assert.equal(summary.observedMs, 4_000);
    assert.equal(summary.upMs, 1_000);
    assert.equal(summary.percentage, 25);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("counts time while the bot was stopped as downtime on restart", async () => {
  const directory = await mkdtemp(join(tmpdir(), "discord-uptime-"));
  let now = 30_000;
  const filePath = join(directory, "uptime.json");
  const options = {
    filePath,
    sampleIntervalMs: 1_000,
    now: () => now,
  };

  try {
    const firstRun = new UptimeTracker(options);
    await firstRun.load();
    await firstRun.start();
    now += 1_000;
    await firstRun.record(true);

    now += 5_000;
    const secondRun = new UptimeTracker(options);
    await secondRun.load();
    await secondRun.start();

    const summary = secondRun.getSummary();
    assert.equal(summary.observedMs, 6_000);
    assert.equal(summary.upMs, 1_000);
    assert.equal(Number(summary.percentage.toFixed(2)), 16.67);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
