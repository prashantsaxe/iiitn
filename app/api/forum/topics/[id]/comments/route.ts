import { NextRequest, NextResponse } from "next/server";
import { Comment, Topic } from "@/lib/db/models/forum";
import mongoose from "mongoose";
import { use } from "react";

export async function GET(
  req: NextRequest, 
  context: { params: { id: string } }
) {
  try {
    // Unwrap the params object using React.use()
    const { id: topicId } = await context.params;
    
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const lastCreatedAt = searchParams.get("lastCreatedAt");

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const query: any = { topicId, isActive: true };
    if (lastCreatedAt) {
      query.createdAt = { $lt: new Date(lastCreatedAt) };
    }

    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({
      comments,
      hasMore: comments.length === limit,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest, 
  context: { params: { id: string } }
) {
  try {
    // Unwrap the params object using React.use()
    const { id: topicId } = await context.params;
    
    const data = await req.json();

    if (!data.content) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const comment = new Comment({ ...data, topicId });
    await comment.save();

    await Topic.findByIdAndUpdate(
      topicId,
      { $inc: { commentsCount: 1 } }
    );

    return NextResponse.json({ message: "Comment added successfully", comment }, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}