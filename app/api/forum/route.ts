import { NextRequest, NextResponse } from "next/server";
import { Topic } from "@/lib/models/student/forum";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10"); // Number of topics to fetch
    const lastCreatedAt = searchParams.get("lastCreatedAt"); // Timestamp of the last loaded topic
    
    // Ensure MongoDB connection
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Build query for lazy loading
    const query: any = { isActive: true };
    if (lastCreatedAt) {
      // Fetch topics created before the last timestamp
      query.createdAt = { $lt: new Date(lastCreatedAt) };
    }

    // Fetch topics
    const topics = await Topic.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .limit(limit);

    return NextResponse.json({
      topics,
      hasMore: topics.length === limit, // Indicate if there are more topics to load
      lastCreatedAt: topics.length > 0 ? topics[topics.length - 1].createdAt : null
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.title || !data.content || !data.company) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const topic = new Topic(data);
    await topic.save();

    return NextResponse.json({ message: "Topic created successfully", topic }, { status: 201 });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 });
  }
}