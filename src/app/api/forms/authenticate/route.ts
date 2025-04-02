import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
export async function POST(request: NextRequest) {
  try {
    const { formUrl, password } = await request.json();
    if (!formUrl || !password) {
      return NextResponse.json(
        { error: "Missing form URL or password" },
        { status: 400 },
      );
    }
    
    const form = await db.form.findUnique({
      where: { id: formUrl },
    });
    if (!form || form.password !== password) {
      return NextResponse.json(
        { error: "Invalid form URL or password" },
        { status: 403 },
      );
    }
    
    
    const formData = form.data as any;
    const title = formData.title || "Untitled Form";
    
    return NextResponse.json({
      token: "authenticated", 
      formId: form.id,
      title,
      createdAt: form.createdAt,
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
