import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const formId = params.formId;
    console.log("GET request for form:", formId);

    // Get auth token (optional for future verification)
    const authHeader = request.headers.get("Authorization");

    // Find the form by ID
    const form = await db.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      console.error(`Form not found: "${formId}"`);
      return NextResponse.json(
        { error: `Form not found: "${formId}"` },
        { status: 404 },
      );
    }

    // Return the form data
    return NextResponse.json(form.data);
  } catch (error) {
    console.error("Error in forms/[formId] GET handler:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const formId = params.formId;
    console.log("PUT request for form:", formId);

    const requestData = await request.json();

    if (!requestData.data || !requestData.password) {
      return NextResponse.json(
        { error: "Missing form data or password" },
        { status: 400 },
      );
    }

    // Authenticate using password
    const form = await db.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (form.password !== requestData.password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 403 });
    }

    // Update the form
    const updatedForm = await db.form.update({
      where: { id: formId },
      data: {
        data: requestData.data,
      },
    });

    return NextResponse.json({
      id: updatedForm.id,
      title: requestData.data.title || "Untitled Form",
      updatedAt: updatedForm.updatedAt,
    });
  } catch (error) {
    console.error("Error in forms/[formId] PUT handler:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
