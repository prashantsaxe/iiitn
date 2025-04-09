import { NextRequest, NextResponse } from "next/server";
import { Comment } from "@/lib/models/student/forum";
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10"); // Number of comments to fetch
    const lastCreatedAt = searchParams.get("lastCreatedAt"); // Timestamp of the last loaded comment

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Build the query for lazy loading
    const query: any = { topicId: params.id, isActive: true };
    if (lastCreatedAt) {
      query.createdAt = { $lt: new Date(lastCreatedAt) }; // Fetch comments created before the last timestamp
    }

    // Fetch comments
    const comments = await Comment.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(limit);

    return NextResponse.json({
      comments,
      hasMore: comments.length === limit, // Indicate if there are more comments to load
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();

    if (!data.content) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const comment = new Comment({ ...data, topicId: params.id });
    await comment.save();

    return NextResponse.json({ message: "Comment added successfully", comment }, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}