import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

// Simple JSON-backed store so approvals survive route reloads.
const DATA_DIR = path.join(process.cwd(), "data");
const APPROVALS_FILE = path.join(DATA_DIR, "approvals.json");

function ensureStoreFile() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(APPROVALS_FILE)) {
    writeFileSync(APPROVALS_FILE, "{}", "utf-8");
  }
}

function readPersistedApprovals(): Map<string, boolean> {
  try {
    ensureStoreFile();
    const contents = readFileSync(APPROVALS_FILE, "utf-8");
    const parsed = JSON.parse(contents) as Record<string, boolean>;
    return new Map(Object.entries(parsed));
  } catch (error) {
    console.error("Failed to read approvals store, starting fresh", error);
    return new Map();
  }
}

function writePersistedApprovals(approvals: Map<string, boolean>) {
  try {
    ensureStoreFile();
    const payload = JSON.stringify(Object.fromEntries(approvals), null, 2);
    writeFileSync(APPROVALS_FILE, payload, "utf-8");
  } catch (error) {
    console.error("Failed to persist approvals store", error);
  }
}

class ApprovalsStore {
  private approvals = readPersistedApprovals();

  setApproval(reviewId: string, approved: boolean): void {
    this.approvals.set(reviewId, approved);
    writePersistedApprovals(this.approvals);
  }

  approve(reviewId: string): void {
    this.setApproval(reviewId, true);
  }

  unapprove(reviewId: string): void {
    this.setApproval(reviewId, false);
  }

  isApproved(reviewId: string): boolean {
    return this.approvals.get(reviewId) ?? false;
  }

  getApproval(reviewId: string): boolean | undefined {
    return this.approvals.get(reviewId);
  }

  getAll(): Record<string, boolean> {
    return Object.fromEntries(this.approvals);
  }
}

export const approvalsStore = new ApprovalsStore();
