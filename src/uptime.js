import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export const DEFAULT_SAMPLE_INTERVAL_MS = 30_000;

export class UptimeTracker {
  constructor({
    filePath = "data/uptime.json",
    sampleIntervalMs = DEFAULT_SAMPLE_INTERVAL_MS,
    now = Date.now,
  } = {}) {
    this.filePath = filePath;
    this.sampleIntervalMs = sampleIntervalMs;
    this.now = now;
    this.state = null;
    this.pendingSave = Promise.resolve();
  }

  async load() {
    try {
      const content = await readFile(this.filePath, "utf8");
      const state = JSON.parse(content);
      if (
        !Number.isFinite(state.trackingSince) ||
        !Number.isFinite(state.totalObservedMs) ||
        !Number.isFinite(state.totalUpMs) ||
        !Number.isFinite(state.lastSampleAt) ||
        typeof state.lastKnownUp !== "boolean"
      ) {
        throw new Error(`Invalid uptime data in ${this.filePath}`);
      }
      this.state = state;
    } catch (error) {
      if (error.code === "ENOENT") {
        this.state = null;
        return;
      }
      throw error;
    }
  }

  async start() {
    const now = this.now();

    if (!this.state) {
      this.state = {
        trackingSince: now,
        totalObservedMs: 0,
        totalUpMs: 0,
        lastSampleAt: now,
        lastKnownUp: true,
      };
    } else {
      // Any unobserved gap before startup is conservatively counted as downtime.
      this.state.totalObservedMs += Math.max(0, now - this.state.lastSampleAt);
      this.state.lastSampleAt = now;
      this.state.lastKnownUp = true;
    }

    await this.save();
  }

  async record(isUp, at = this.now()) {
    if (!this.state) {
      throw new Error("Uptime tracker must be started before recording samples.");
    }

    const elapsed = Math.max(0, at - this.state.lastSampleAt);
    this.state.totalObservedMs += elapsed;

    // A delayed heartbeat is treated as unavailable rather than overstating uptime.
    if (this.state.lastKnownUp && elapsed <= this.sampleIntervalMs * 2) {
      this.state.totalUpMs += elapsed;
    }

    this.state.lastSampleAt = at;
    this.state.lastKnownUp = isUp;
    await this.save();
  }

  getSummary(at = this.now()) {
    if (!this.state) {
      throw new Error("Uptime tracker must be started before reading its summary.");
    }

    const elapsed = Math.max(0, at - this.state.lastSampleAt);
    const observedMs = this.state.totalObservedMs + elapsed;
    const upMs =
      this.state.totalUpMs +
      (this.state.lastKnownUp && elapsed <= this.sampleIntervalMs * 2
        ? elapsed
        : 0);

    return {
      trackingSince: this.state.trackingSince,
      observedMs,
      upMs,
      percentage: observedMs === 0 ? 100 : (upMs / observedMs) * 100,
    };
  }

  async save() {
    this.pendingSave = this.pendingSave.then(async () => {
      await mkdir(dirname(this.filePath), { recursive: true });
      const temporaryPath = `${this.filePath}.tmp`;
      await writeFile(temporaryPath, JSON.stringify(this.state, null, 2), "utf8");
      await rename(temporaryPath, this.filePath);
    });
    await this.pendingSave;
  }
}
