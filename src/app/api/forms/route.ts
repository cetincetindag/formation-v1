import { NextResponse } from 'next/server';
import { db } from '~/server/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('form_id');

    if (!formId) {
      return NextResponse.json({ error: 'Missing form ID' }, { status: 400 });
    }

    const form = await db.form.findUnique({
      where: {
        id: formId,
      },
    });

    console.log(form)

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json({ error: 'Error fetching form' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const newForm = await db.form.create({
      data: data,
    });

    return NextResponse.json(newForm, { status: 201 });
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json({ error: 'Error creating form' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('form_id');
    const password = searchParams.get('password');

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

    await db.$transaction([
      db.response.deleteMany({ where: { formId } }),
      db.form.delete({ where: { id: formId } })
    ]);

    return NextResponse.json({ message: 'Form and associated responses deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json({ error: 'Error deleting form' }, { status: 500 });
  }
}
