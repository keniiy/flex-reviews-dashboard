// In-memory store for review approvals
// In production, this would be a database

class ApprovalsStore {
  private approvals = new Map<string | number, boolean>();

  approve(reviewId: number): void {
    this.approvals.set(reviewId, true);
  }

  unapprove(reviewId: string): void {
    this.approvals.set(reviewId, false);
  }

  isApproved(reviewId: string): boolean {
    return this.approvals.get(reviewId) ?? false;
  }

  getAll(): Record<string, boolean> {
    return Object.fromEntries(this.approvals);
  }
}

export const approvalsStore = new ApprovalsStore();
