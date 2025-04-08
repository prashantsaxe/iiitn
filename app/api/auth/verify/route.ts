// app/api/auth/verify/route.ts

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const userRecord = await db.collection("magic_links").findOne({ email });
  if (!userRecord) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    const isValid = bcrypt.compareSync(token, userRecord.hashedToken);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Set secure cookie (NextResponse only supports limited cookie options natively)
    const response = NextResponse.redirect(new URL("/dashboard", req.url), { status: 307 });
    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Token expired or invalid" }, { status: 400 });
  }
}
