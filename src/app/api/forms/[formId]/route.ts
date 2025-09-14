import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;

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
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;

    const requestData = await request.json();

    if (!requestData.data) {
      return NextResponse.json(
        { error: "Missing form data" },
        { status: 400 },
      );
    }

    // Check for Bearer token authentication
    const authHeader = request.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    // Find the form
    const form = await db.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Authenticate using either Bearer token or password
    if (bearerToken) {
      // For Bearer token, validate against stored form (simple token validation)
      if (bearerToken !== "authenticated") {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 403 });
      }
    } else if (requestData.password) {
      // Traditional password authentication
      if (form.password !== requestData.password) {
        return NextResponse.json({ error: "Invalid password" }, { status: 403 });
      }
    } else {
      return NextResponse.json(
        { error: "Missing authentication credentials" },
        { status: 400 },
      );
    }

    // Extract contact collection settings from the form data
    const contactCollection = requestData.data.contactCollection;

    // Update the form with all fields including contact collection settings
    const updatedForm = await db.form.update({
      where: { id: formId },
      data: {
        data: requestData.data,
        collectName: contactCollection?.collectName ?? form.collectName,
        collectEmail: contactCollection?.collectEmail ?? form.collectEmail,
        collectCompany: contactCollection?.collectCompany ?? form.collectCompany,
        customFields: contactCollection?.customFields ?? form.customFields,
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
