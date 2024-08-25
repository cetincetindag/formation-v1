import { NextResponse } from 'next/server';
import { db } from '~/server/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('form_id');
    const password = searchParams.get('password');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = 20;

    if (!formId || !password) {
      return NextResponse.json({ error: 'Missing form ID or password' }, { status: 400 });
    }

    const form = await db.form.findUnique({
      where: { id: formId }
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (form.password !== password) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 403 });
    }

    const totalResponses = await db.response.count({ where: { formId } });
    const totalPages = Math.max(1, Math.ceil(totalResponses / pageSize));

    const responses = await db.response.findMany({
      where: { formId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({
      responses,
      currentPage: page,
      totalPages,
      totalResponses,
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json({ error: 'Error fetching responses' }, { status: 500 });
  }
}

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
