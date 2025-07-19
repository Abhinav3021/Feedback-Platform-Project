import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import Response from '@/models/Response';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    await dbConnect();
    const admin = getUserFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the form belongs to the admin
    const form = await Form.findOne({
      _id: params.formId,
      userId: admin.userId,
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const responses = await Response.find({ formId: params.formId })
      .sort({ submittedAt: -1 });

    // Generate CSV content
    const headers = [
      'Submission Date',
      'IP Address',
      ...form.questions.map(q => q.question),
    ];

    const csvRows = [
      headers.join(','),
      ...responses.map(response => {
        const row = [
          new Date(response.submittedAt).toISOString(),
          response.ipAddress || 'Unknown',
        ];

        // Add answers for each question
        form.questions.forEach(question => {
          const answer = response.answers.find(a => a.questionId === question.id);
          // Escape commas and quotes in CSV
          const answerText = answer ? answer.answer.replace(/"/g, '""') : '';
          row.push(`"${answerText}"`);
        });

        return row.join(',');
      }),
    ];

    const csvContent = csvRows.join('\n');
    const fileName = `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_responses_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('Export responses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
