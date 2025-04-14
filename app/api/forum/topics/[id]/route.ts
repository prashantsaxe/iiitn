import { NextRequest, NextResponse } from "next/server";
import { Topic } from "@/lib/db/models/forum";
import mongoose from "mongoose";
import { use } from "react";

/**
 * GET handler to fetch a single topic by ID with essential data
 */
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    // Unwrap params using React.use()
    const params = await context.params;
    const topicId = params.id;
    
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return NextResponse.json({ error: "Invalid topic ID format" }, { status: 400 });
    }

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const topic = await Topic.findById(topicId);

    if (!topic || !topic.isActive) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Increment view count
    await Topic.findByIdAndUpdate(topicId, { $inc: { viewsCount: 1 } });

    // Convert to plain object
    const topicData: { [key: string]: any; isLiked?: boolean } = topic.toObject();
    
    // Add like status if userId is provided
    const userId = req.nextUrl.searchParams.get("userId");
    if (userId) {
      // Safely check if a user has liked the topic
      // This handles the case where isLikedByUser method might not exist
      try {
        if (typeof topic.isLikedByUser === 'function') {
          topicData.isLiked = topic.isLikedByUser(userId);
        } else {
          // Fallback implementation if the method doesn't exist
          const likes = topic.likes || { users: [] };
          topicData.isLiked = likes.users.some(
            (id) => id.toString() === userId.toString()
          );
        }
      } catch (err) {
        console.error("Error checking like status:", err);
        topicData.isLiked = false; // Default to not liked if there's an error
      }
    }

    return NextResponse.json({
      topic: topicData,
      commentsCount: topic.commentsCount || 0
    });
  } catch (error) {
    console.error(`Error fetching topic:`, error);
    return NextResponse.json({ error: "Failed to fetch topic" }, { status: 500 });
  }
}

/**
 * PATCH handler to update a topic
 */
export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params;
    const topicId = params.id;
    
    const data = await req.json();

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No update data provided" }, { status: 400 });
    }

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const allowedUpdates = {
      title: data.title,
      content: data.content,
      tags: data.tags,
      isActive: data.isActive,
      isPinned: data.isPinned
    };

    const updates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, v]) => v !== undefined)
    );

    const updatedTopic = await Topic.findByIdAndUpdate(
      topicId, 
      { $set: updates }, 
      { new: true, runValidators: true }
    );

    if (!updatedTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Topic updated successfully",
      topic: updatedTopic
    });
  } catch (error) {
    console.error(`Error updating topic:`, error);
    return NextResponse.json({ error: "Failed to update topic" }, { status: 500 });
  }
}

/**
 * DELETE handler to remove a topic
 */
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params;
    const topicId = params.id;
    
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const deletedTopic = await Topic.findByIdAndUpdate(
      topicId, 
      { isActive: false }, 
      { new: true }
    );

    if (!deletedTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Topic deleted successfully" });
  } catch (error) {
    console.error(`Error deleting topic:`, error);
    return NextResponse.json({ error: "Failed to delete topic" }, { status: 500 });
  }
}