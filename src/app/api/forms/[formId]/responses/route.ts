import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import Response from '@/models/Response';
import { getUserFromRequest } from '@/lib/auth';

// Submit a response to a form (public)
export async function POST(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    await dbConnect();

    // Get form to validate it exists and is active
    const form = await Form.findById(params.formId);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (!form.isActive) {
      return NextResponse.json(
        { error: 'This form is no longer accepting responses' },
        { status: 400 }
      );
    }

    const { answers } = await request.json();

    // Validation
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      );
    }

    // Validate that all required questions are answered
    const requiredQuestions = form.questions.filter(q => q.required);
    const answeredQuestionIds = answers.map(a => a.questionId);

    for (const requiredQ of requiredQuestions) {
      if (!answeredQuestionIds.includes(requiredQ.id)) {
        return NextResponse.json(
          { error: `Question "${requiredQ.question}" is required` },
          { status: 400 }
        );
      }
    }

    // Get client IP and User Agent for analytics
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const response = new Response({
      formId: params.formId,
      answers,
      ipAddress,
      userAgent,
    });

    await response.save();

    return NextResponse.json(
      { message: 'Response submitted successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Response submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get responses for a form (admin only)
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

    // Calculate summary statistics
    const totalResponses = responses.length;
    const summary = {
      totalResponses,
      averageResponsesPerDay: 0,
      questionSummaries: [] as any[],
    };

    if (totalResponses > 0) {
      // Calculate average responses per day
      const oldestResponse = responses[responses.length - 1];
      const daysSinceFirst = Math.max(
        1,
        Math.ceil(
          (Date.now() - oldestResponse.submittedAt.getTime()) / (1000 * 60 * 60 * 24)
        )
      );
      summary.averageResponsesPerDay = Math.round((totalResponses / daysSinceFirst) * 100) / 100;

      // Generate question summaries
      summary.questionSummaries = form.questions.map(question => {
        const questionAnswers = responses
          .map(r => r.answers.find(a => a.questionId === question.id))
          .filter(Boolean);

        if (question.type === 'multiple-choice') {
          // Count occurrences of each option
          const optionCounts = question.options?.reduce((acc: any, option: string) => {
            acc[option] = 0;
            return acc;
          }, {}) || {};

          questionAnswers.forEach(answer => {
            if (answer && optionCounts.hasOwnProperty(answer.answer)) {
              optionCounts[answer.answer]++;
            }
          });

          return {
            questionId: question.id,
            question: question.question,
            type: question.type,
            totalAnswers: questionAnswers.length,
            optionCounts,
          };
        } else {
          // For text questions, just return recent answers
          return {
            questionId: question.id,
            question: question.question,
            type: question.type,
            totalAnswers: questionAnswers.length,
            recentAnswers: questionAnswers.slice(0, 10).map(a => a?.answer).filter(Boolean),
          };
        }
      });
    }

    return NextResponse.json({ 
      form,
      responses,
      summary,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Fetching responses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
