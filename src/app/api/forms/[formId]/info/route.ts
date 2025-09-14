import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const formUrl = formId;
    
    const authHeader = request.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    
    if (!bearerToken || bearerToken !== "authenticated") {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 403 }
      );
    }

    const form = await db.form.findUnique({
      where: { id: formUrl },
      select: {
        id: true,
        data: true,
        createdAt: true,
        updatedAt: true,
        collectName: true,
        collectEmail: true,
        collectCompany: true,
        customFields: true,
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }

    const formData = form.data as any;
    
    return NextResponse.json({
      id: form.id,
      title: formData.title || "Untitled Form",
      description: formData.description || "",
      link: formData.link || "",
      link_description: formData.link_description || "",
      form_content: formData.form_content || [],
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
      contactCollection: {
        collectName: form.collectName,
        collectEmail: form.collectEmail,
        collectCompany: form.collectCompany,
        customFields: form.customFields || [],
      },
    });

  } catch (error) {
    console.error("Error fetching form info:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}