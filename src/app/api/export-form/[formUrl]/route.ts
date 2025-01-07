import { NextResponse } from "next/server";
import { db } from "~/server/db";
import type { FormComponent, FormStructure } from "~/types/formtypes";

export async function POST(
  request: Request,
  { params }: { params: { formUrl: string } },
) {
  try {
    const { format } = await request.json();
    const form = await db.form.findUnique({
      where: { id: params.formUrl },
      include: { responses: true },
    });

    if (!form || !form.responses || form.responses.length === 0) {
      return NextResponse.json(
        { error: "No responses found" },
        { status: 404 },
      );
    }

    const formStructure = form.data as unknown as FormStructure;

    if (format === "csv") {
      const csv = generateCSV(form.responses, formStructure);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv;charset=utf-8",
          "Content-Disposition": `attachment; filename=form-${params.formUrl}-responses.csv`,
        },
      });
    } else if (format === "xml") {
      const xml = generateXML(form.responses, formStructure);
      return new NextResponse(xml, {
        headers: {
          "Content-Type": "application/xml;charset=utf-8",
          "Content-Disposition": `attachment; filename=form-${params.formUrl}-responses.xml`,
        },
      });
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

function generateCSV(responses: any[], formStructure: FormStructure) {
  // Get headers from form structure
  const headers = [
    "Submission Date",
    ...formStructure.form_content.map((component) => component.title),
  ];

  // Generate rows
  const rows = responses.map((response) => {
    const responseData = response.data as Record<string, any>;
    return [
      new Date(response.createdAt).toISOString(),
      ...formStructure.form_content.map((component) => {
        const value = responseData[component.title] ?? "N/A";
        return Array.isArray(value) ? value.join("; ") : value;
      }),
    ];
  });

  // Escape and format CSV
  const escapeCsvValue = (value: any) => {
    const stringValue = String(value);
    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
}

function generateXML(responses: any[], formStructure: FormStructure) {
  const responseXml = responses
    .map((response) => {
      const responseData = response.data as Record<string, any>;
      const fields = formStructure.form_content
        .map((component) => {
          const value = responseData[component.title] ?? "N/A";
          const sanitizedTitle = component.title.replace(/[^a-zA-Z0-9]/g, "_");
          const sanitizedValue = Array.isArray(value)
            ? value.map((v) => `<item>${escapeXml(String(v))}</item>`).join("")
            : escapeXml(String(value));

          return Array.isArray(value)
            ? `<${sanitizedTitle}>${sanitizedValue}</${sanitizedTitle}>`
            : `<${sanitizedTitle}>${sanitizedValue}</${sanitizedTitle}>`;
        })
        .join("\n      ");

      return `
    <response>
      <submissionDate>${new Date(response.createdAt).toISOString()}</submissionDate>
      ${fields}
    </response>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<responses>${responseXml}
</responses>`;
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
