import { approvalsStore } from "@/modules/reviews/approvals.store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, approved } = body;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "reviewId is required" },
        { status: 400 }
      );
    }

    if (approved) {
      approvalsStore.approve(reviewId);
    } else {
      approvalsStore.unapprove(reviewId);
    }

    return NextResponse.json({
      success: true,
      reviewId,
      approved: approvalsStore.isApproved(reviewId),
    });
  } catch (error) {
    console.error("Error updating approval:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update approval" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    approvals: approvalsStore.getAll(),
  });
}
