import { NextResponse } from 'next/server';
import { db } from '~/server/db';

export async function POST(request: Request) {
  try {
    const { formId, data } = await request.json();

    if (!formId || typeof formId !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing formId' }, { status: 400 });
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid or missing data' }, { status: 400 });
    }

    const form = await db.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const newResponse = await db.response.create({
      data: {
        formId: formId,
        data: data,
      },
    });

    return NextResponse.json(newResponse, { status: 201 });
  } catch (error) {
    console.error('Error creating response:', error);
    return NextResponse.json({ error: 'Error creating response' }, { status: 500 });
  }
}
