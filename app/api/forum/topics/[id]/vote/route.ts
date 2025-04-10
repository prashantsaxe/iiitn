import { NextRequest, NextResponse } from "next/server";
import { Topic } from "@/lib/models/student/forum";
import mongoose from "mongoose";



export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { action,userId } = await req.json();

    if (!["upvote", "downvote"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const result =
      action === "upvote"
        ? await Topic.upvote(params.id, userId) // Replace userId with actual user ID
        : await Topic.downvote(params.id, userId);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 404 });
    }

    return NextResponse.json({ message: result.message });
  } catch (error) {
    console.error("Error processing vote:", error);
    return NextResponse.json({ error: "Failed to process vote" }, { status: 500 });
  }
}