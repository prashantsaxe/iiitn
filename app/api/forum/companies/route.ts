import { NextRequest, NextResponse } from "next/server";
import { Topic } from "@/lib/db/models/forum";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Aggregate to get companies and their topic counts
    const companyStats = await Topic.aggregate([
      { $match: { isActive: true } }, // Only consider active topics
      { $group: { _id: "$company", count: { $sum: 1 } } }, // Group by company name and count
      { $project: { _id: 0, name: "$_id", count: 1 } }, // Reshape for better readability
      { $sort: { count: -1, name: 1 } } // Sort by count desc, then name asc
    ]);

    return NextResponse.json({ companies: companyStats });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}