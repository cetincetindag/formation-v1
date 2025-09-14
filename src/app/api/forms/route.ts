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
    
    // Check for Bearer token authentication
    const authHeader = request.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    
    if (!formId) {
      return NextResponse.json({ error: "Missing form ID" }, { status: 400 });
    }
    
    // Handle both password and Bearer token authentication
    if (password || bearerToken) {
      let form = null;
      
      if (bearerToken) {
        // For Bearer token, validate against stored form
        form = await db.form.findUnique({
          where: { id: formId },
        });
        // Simple token validation - in production, use proper JWT validation
        if (!form || bearerToken !== "authenticated") {
          return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 403 },
          );
        }
      } else if (password) {
        form = await validateFormPassword(formId, password);
        if (!form) {
          return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 403 },
          );
        }
      }
      const totalResponses = await db.response.count({ where: { formId } });
      const responses = await db.response.findMany({
        where: { formId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      });

      // Also get the form settings to include contact collection config
      const formSettings = await db.form.findUnique({
        where: { id: formId },
        select: {
          collectName: true,
          collectEmail: true,
          collectCompany: true,
          customFields: true,
        },
      });

      return NextResponse.json({
        responses,
        currentPage: page,
        totalPages: Math.ceil(totalResponses / pageSize),
        totalResponses,
        formSettings,
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
      
      // Extract contact collection settings from the form data
      const contactCollection = requestData.data.contactCollection;
      
      const newForm = await db.form.create({
        data: {
          id: formId,
          data: requestData.data, 
          password: requestData.password,
          collectName: contactCollection?.collectName ?? true,
          collectEmail: contactCollection?.collectEmail ?? true,
          collectCompany: contactCollection?.collectCompany ?? false,
          customFields: contactCollection?.customFields ?? [],
        },
      });
      
      const responseData = {
        id: newForm.id,
        title: requestData.data.title || "Untitled Form",
        createdAt: newForm.createdAt,
      };
      return NextResponse.json(responseData, { status: 201 });
    }
    
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
