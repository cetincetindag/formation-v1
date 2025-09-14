import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ responseId: string }> }
) {
  try {
    const { responseId } = await params;
    
    const authHeader = request.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    
    if (!bearerToken || bearerToken !== "authenticated") {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 403 }
      );
    }

    const response = await db.response.findUnique({
      where: { id: responseId },
      include: {
        form: {
          select: {
            id: true,
            data: true,
            collectName: true,
            collectEmail: true,
            collectCompany: true,
            customFields: true,
          },
        },
      },
    });

    if (!response) {
      return NextResponse.json(
        { error: "Response not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: response.id,
      data: response.data,
      contactName: response.contactName,
      contactEmail: response.contactEmail,
      contactCompany: response.contactCompany,
      customData: response.customData,
      createdAt: response.createdAt,
      formId: response.formId,
      form: response.form,
    });

  } catch (error) {
    console.error("Error fetching response:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ responseId: string }> }
) {
  try {
    const { responseId } = await params;
    
    const authHeader = request.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    
    if (!bearerToken || bearerToken !== "authenticated") {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 403 }
      );
    }

    const response = await db.response.findUnique({
      where: { id: responseId },
    });

    if (!response) {
      return NextResponse.json(
        { error: "Response not found" },
        { status: 404 }
      );
    }

    await db.response.delete({
      where: { id: responseId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting response:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}