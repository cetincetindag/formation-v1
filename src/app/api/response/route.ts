import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

export async function POST(request: NextRequest) {
  try {
    const { formId, data, contactData } = await request.json();

    if (!formId) {
      return NextResponse.json({ message: "Missing form ID" }, { status: 400 });
    }

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { message: "Invalid response data" },
        { status: 400 },
      );
    }

    // Check if the form exists
    const form = await db.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      return NextResponse.json({ message: "Form not found" }, { status: 404 });
    }

    // Create the response record with contact data
    await db.response.create({
      data: {
        formId,
        data,
        contactName: contactData?.name || null,
        contactEmail: contactData?.email || null,
        contactCompany: contactData?.company || null,
        customData: contactData?.customData || {},
      },
    });

    return NextResponse.json(
      { message: "Response submitted successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error submitting form response:", error);
    return NextResponse.json(
      { message: "Failed to submit response" },
      { status: 500 },
    );
  }
}
