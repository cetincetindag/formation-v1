import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

async function validateFormPassword(formId: string, password: string) {
  const form = await db.form.findUnique({
    where: { id: formId },
  });

  if (!form || form.password !== password) {
    return null;
  }
  return form;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const formId = searchParams.get("form_id");
    const password = searchParams.get("password");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 10 as const;

    if (!formId) {
      return NextResponse.json({ error: "Missing form ID" }, { status: 400 });
    }

    if (password) {
      const form = await validateFormPassword(formId, password);
      if (!form) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 403 },
        );
      }

      const totalResponses = await db.response.count({ where: { formId } });

      const responses = await db.response.findMany({
        where: { formId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        responses,
        currentPage: page,
        totalPages: Math.ceil(totalResponses / pageSize),
        totalResponses,
      });
    }

    const form = await db.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error("Error fetching form responses:", error);
    return NextResponse.json(
      { error: "Error fetching form responses" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (data.formId && data.data) {
      const newResponse = await db.response.create({
        data: {
          formId: data.formId,
          data: data.data,
        },
      });
      return NextResponse.json(newResponse, { status: 201 });
    }

    // Handle form creation
    if (data.title) {
      const newForm = await db.form.create({
        data: data,
      });
      return NextResponse.json(newForm, { status: 201 });
    }

    // Handle password validation
    if (data.formUrl && data.password) {
      const form = await validateFormPassword(data.formUrl, data.password);
      if (!form) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 403 },
        );
      }
      return NextResponse.json({
        success: true,
        token: Buffer.from(`${data.formUrl}:${data.password}`).toString(
          "base64",
        ), // Simple token generation
      });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

