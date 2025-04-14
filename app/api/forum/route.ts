import { NextRequest, NextResponse } from "next/server";
import { Topic } from "@/lib/db/models/forum";
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
    // Parse as FormData instead of JSON
    const formData = await req.formData();
    
    // Extract basic fields
    const title = formData.get('title') as string | null;
    const company = formData.get('company') as string | null;
    const content = formData.get('content') as string | null;
    const createdByString = formData.get('createdBy') as string | null;
    const imageFile = formData.get('image') as File | null;
    
    // Validate required fields
    if (!title || !content || !company) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Parse createdBy from JSON string
    let createdBy;
    try {
      if (createdByString) {
        createdBy = JSON.parse(createdByString);
      }
    } catch (parseError) {
      console.error("Error parsing createdBy JSON:", parseError);
      return NextResponse.json({ error: "Invalid user data format" }, { status: 400 });
    }
    
    // Ensure MongoDB connection
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    // Prepare topic data
    const topicData: any = {
      title,
      company,
      content,
      createdBy,
    };
    
    // Handle image if present
    if (imageFile) {
      // Convert File to buffer for storage
      const buffer = await imageFile.arrayBuffer();
      
      // For simple implementation, we'll just log image details
      // In production, you'd likely:
      // 1. Upload to a service like Cloudinary or AWS S3
      // 2. Store the URL in the database
      console.log(`Received image: ${imageFile.name}, type: ${imageFile.type}, size: ${imageFile.size} bytes`);
      
      // Example: If you want to store image metadata
      topicData.image = {
        name: imageFile.name,
        type: imageFile.type,
        // The actual image upload code would go here
        // You'd store the URL returned from the upload service
        // url: await uploadImage(buffer) 
      };
    }
    
    // Create and save topic
    const topic = new Topic(topicData);
    await topic.save();
    
    return NextResponse.json({ message: "Topic created successfully", topic }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating topic:", error);
    return NextResponse.json({ 
      error: "Failed to create topic", 
      details: error.message 
    }, { status: 500 });
  }
}