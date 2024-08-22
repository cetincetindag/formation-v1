import { NextResponse } from 'next/server';
import { db } from '~/server/db';


export async function GET() {
  try {
    const forms = await db.form.findMany();
    return NextResponse.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json({ error: 'Error fetching forms' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const password = '123456'

    const newForm = await db.form.create({
      data: {
        password: password,
        data: data
      },
    });

    return NextResponse.json(newForm, { status: 201 });
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json({ error: 'Error creating form' }, { status: 500 });
  }
}


