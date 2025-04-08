import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const { email, role } = await req.json();

  if (!email || !role) return NextResponse.json({ error: "Email and role required" }, { status: 400 });

  const token = jwt.sign({ email, role }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
  const hashedToken = bcrypt.hashSync(token, 10);

  await db.collection("magic_links").updateOne(
    { email },
    { $set: { hashedToken, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
    { upsert: true }
  );

  const magicLink = `${process.env.NEXT_PUBLIC_URL}/api/auth/verify?token=${token}&email=${email}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Placement IIITN" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Magic Link for Login",
    html: `<p>Click below to log in as <b>${role}</b>:</p>
           <a href="${magicLink}">Login Now</a>
           <p>This link expires in 15 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Magic link sent!" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
