import { NextRequest, NextResponse } from "next/server";
import { Topic } from "@/lib/models/student/forum";
import mongoose from "mongoose";

/**
 * GET handler to fetch a single topic by ID with essential data
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Ensure valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid topic ID format" }, { status: 400 });
    }

    // Ensure MongoDB connection
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Find the topic
    const topic = await Topic.findById(params.id);

    // Return 404 if topic not found or not active
    if (!topic || !topic.isActive) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Increment view count
    await Topic.findByIdAndUpdate(params.id, { $inc: { viewsCount: 1 } });

    // Convert the Mongoose document to a plain object
    const topicData = topic.toObject();

    // Add calculated netVotes
    topicData.netVotes = topic.upvotes.count - topic.downvotes.count;

    // Check if user's vote status should be included
    const userId = req.nextUrl.searchParams.get("userId");
    if (userId) {
      topicData.getUserVoteStatus = (userId) => topic.getUserVoteStatus?.(userId) || 'none';
    }

    // // For privacy, remove the arrays of user IDs who voted
    // delete topicData.upvotes.users;
    // delete topicData.downvotes.users;

    // Return the topic data
    return NextResponse.json({
      topic: topicData,
      commentsCount: topic.commentsCount || 0
    });
  } catch (error) {
    console.error(`Error fetching topic ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to fetch topic" }, { status: 500 });
  }
}

/**
 * PATCH handler to update a topic
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get request body
    const data = await req.json();
    
    // Check required fields for validation
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No update data provided" }, { status: 400 });
    }

    // Ensure MongoDB connection
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Only allow updating specific fields (security)
    const allowedUpdates = {
      title: data.title,
      content: data.content,
      tags: data.tags,
      isActive: data.isActive,
      isPinned: data.isPinned
    };

    // Filter out undefined values
    const updates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, v]) => v !== undefined)
    );

    // Update the topic
    const updatedTopic = await Topic.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Check if topic exists
    if (!updatedTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Topic updated successfully",
      topic: updatedTopic
    });
  } catch (error) {
    console.error(`Error updating topic ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to update topic" }, { status: 500 });
  }
}

/**
 * DELETE handler to remove a topic
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Ensure MongoDB connection
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Soft delete (mark as inactive)
    const deletedTopic = await Topic.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    // Check if topic exists
    if (!deletedTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Topic deleted successfully"
    });
  } catch (error) {
    console.error(`Error deleting topic ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to delete topic" }, { status: 500 });
  }
}