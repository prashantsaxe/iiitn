import { NextRequest, NextResponse } from "next/server";
import { Topic } from "@/lib/db/models/forum";
import mongoose from "mongoose";

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  try {
    // Unwrap params
    const params = await context.params;
    const topicId = params.id;
    
    const data = await req.json();
    const { userId } = data;

    // Validate userId exists
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Ensure MongoDB connection
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Toggle like status using the new toggleLike method
    const result = await Topic.toggleLike(topicId, userId);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 404 });
    }

    // Re-fetch the updated topic
    const updatedTopic = await Topic.findById(topicId);
    
    if (!updatedTopic) {
      return NextResponse.json({ message: result.message });
    }
    
    // Convert to plain object
    const topicData = updatedTopic.toObject();
    
    // Instead of using isLikedByUser directly on topicData (which is now a plain object),
    // check it on the Document instance and then add the property to the plain object
    const isLiked = updatedTopic.isLikedByUser(userId);
    
    // Send response with the topic data and an explicit isLiked field
    return NextResponse.json({
      message: result.message,
      liked: result.liked,
      topic: {
        ...topicData,
        isLiked // Add the property to the returned topic object
      }
    });
  } catch (error) {
    console.error("Error processing like:", error);
    return NextResponse.json({ error: "Failed to process like" }, { status: 500 });
  }
}