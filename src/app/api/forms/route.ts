import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { nanoid } from "nanoid";
function generateFormId() {
  return nanoid(11); 
}
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
    if (!form?.data) {
      return NextResponse.json(
        { error: "Form not found or data missing" },
        { status: 404 },
      );
    }
    return NextResponse.json(form.data);
  } catch (error) {
    console.error("Error fetching form data:", error);
    return NextResponse.json(
      { error: "Error fetching form data" },
      { status: 500 },
    );
  }
}
export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    
    if (requestData.data && requestData.password) {
      const formId = generateFormId();
      const newForm = await db.form.create({
        data: {
          id: formId,
          data: requestData.data, 
          password: requestData.password,
        },
      });
      
      const responseData = {
        id: newForm.id,
        title: requestData.data.title || "Untitled Form",
        createdAt: newForm.createdAt,
      };
      return NextResponse.json(responseData, { status: 201 });
    }
    
    console.log("Invalid request data:", requestData);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
