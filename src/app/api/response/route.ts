import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(request: Request) {
  console.log("GET /api/responses route hit");
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get("form_id");
    const password = searchParams.get("password");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = 20;

    console.log(`Params: formId=${formId}, page=${page}`);

    if (!formId || !password) {
      return NextResponse.json(
        { error: "Missing form ID or password" },
        { status: 400 },
      );
    }

    const form = await db.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      console.log(`Form not found: ${formId}`);
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (form.password !== password) {
      console.log("Incorrect password provided");
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 403 },
      );
    }

    const totalResponses = await db.response.count({ where: { formId } });
    const totalPages = Math.max(1, Math.ceil(totalResponses / pageSize));

    const responses = await db.response.findMany({
      where: { formId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    console.log(`Fetched ${responses.length} responses`);

    return NextResponse.json({
      responses,
      currentPage: page,
      totalPages,
      totalResponses,
    });
  } catch (error) {
    console.error("Error in GET /api/responses:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
