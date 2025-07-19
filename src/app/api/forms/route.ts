import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const admin = getUserFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, questions } = await request.json();

    // Validation
    if (!title || !questions) {
      return NextResponse.json(
        { error: 'Title and questions are required' },
        { status: 400 }
      );
    }

    const form = new Form({
      title,
      description,
      questions,
      userId: admin.userId,
    });

    await form.save();

    return NextResponse.json({ message: 'Form created successfully', form }, { status: 201 });
  } catch (error: any) {
    console.error('Form creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const admin = getUserFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const forms = await Form.find({ userId: admin.userId });

    return NextResponse.json({ forms }, { status: 200 });
  } catch (error: any) {
    console.error('Fetching forms error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
