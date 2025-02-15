import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';


export async function GET(request: NextRequest) {
  try {
    const queryParams = await request.json();

    if (queryParams) {
      return;
    }
    else if (!queryParams) {
      try {
        const forms = await db.form.findMany();
        return NextResponse.json(forms);
      } catch (error) {
        console.error('Error fetching forms:', error);
      }
    }
  } catch (error) {
    console.error("Error detected:", error);
    return NextResponse.json({ error: 'Error fetching forms' }, { status: 500 });

  }

  export async function POST(request: NextRequest) {
    try {
      const data = await request.json();

      const newForm = await db.form.create({
        data: data
      });

      return NextResponse.json(newForm, { status: 201 });
    } catch (error) {
      console.error('Error creating form:', error);
      return NextResponse.json({ error: 'Error creating form' }, { status: 500 });
    }
  }


