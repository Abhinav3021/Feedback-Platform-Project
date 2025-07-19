'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Download, 
  BarChart3, 
  MessageSquare, 
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';

interface Answer {
  questionId: string;
  answer: string;
}

interface Response {
  _id: string;
  answers: Answer[];
  submittedAt: string;
  ipAddress?: string;
}

interface Question {
  id: string;
  question: string;
  type: 'text' | 'multiple-choice';
  options?: string[];
}

interface Form {
  _id: string;
  title: string;
  description?: string;
  questions: Question[];
}

interface Summary {
  totalResponses: number;
  averageResponsesPerDay: number;
  questionSummaries: any[];
}

export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/forms/${formId}/responses`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setForm(data.form);
          setResponses(data.responses);
          setSummary(data.summary);
        } else {
          setError('Failed to fetch responses');
        }
      } catch (error) {
        setError('Error loading responses');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formId]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const response = await fetch(`/api/forms/${formId}/export`, {
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${form?.title}_responses.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        setError('Failed to export responses');
      }
    } catch (error) {
      setError('Error exporting responses');
    } finally {
      setExportLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAnswerForQuestion = (response: Response, questionId: string) => {
    const answer = response.answers.find(a => a.questionId === questionId);
    return answer ? answer.answer : '-';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {form?.title} - Responses
                  </h1>
                  {form?.description && (
                    <p className="text-gray-600 mt-1">{form.description}</p>
                  )}
                </div>
              </div>
              <Button onClick={handleExport} disabled={exportLoading || responses.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                {exportLoading ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Summary Stats */}
          {summary && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalResponses}</div>
                  <p className="text-xs text-muted-foreground">
                    Feedback submissions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.averageResponsesPerDay}</div>
                  <p className="text-xs text-muted-foreground">
                    Responses per day
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Questions</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{form?.questions.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Total questions
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Question Analytics */}
          {summary && summary.questionSummaries.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Question Analytics
                </CardTitle>
                <CardDescription>
                  Summary statistics for each question
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {summary.questionSummaries.map((questionSummary, index) => (
                    <div key={questionSummary.questionId} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-medium mb-2">
                        {index + 1}. {questionSummary.question}
                      </h4>
                      <div className="text-sm text-gray-600 mb-2">
                        {questionSummary.totalAnswers} responses
                      </div>
                      
                      {questionSummary.type === 'multiple-choice' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {Object.entries(questionSummary.optionCounts).map(([option, count]) => (
                            <div key={option} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                              <span className="text-sm">{option}</span>
                              <Badge variant="secondary">{count as number}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Recent responses:</div>
                          {questionSummary.recentAnswers.length > 0 ? (
                            <div className="space-y-1">
                              {questionSummary.recentAnswers.slice(0, 3).map((answer: string, idx: number) => (
                                <div key={idx} className="text-sm bg-gray-50 p-2 rounded truncate">
                                  "{answer}"
                                </div>
                              ))}
                              {questionSummary.recentAnswers.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  And {questionSummary.recentAnswers.length - 3} more...
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">No responses yet</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Responses Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Responses</CardTitle>
              <CardDescription>
                Individual responses to your form
              </CardDescription>
            </CardHeader>
            <CardContent>
              {responses.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No responses yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Share your form to start collecting feedback
                  </p>
                  <Link href={`/form/${formId}`} target="_blank">
                    <Button variant="outline">
                      View Public Form
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Submitted At
                          </div>
                        </TableHead>
                        {form?.questions.map((question, index) => (
                          <TableHead key={question.id} className="min-w-[200px]">
                            {index + 1}. {question.question}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responses.map((response) => (
                        <TableRow key={response._id}>
                          <TableCell className="font-medium text-sm">
                            {formatDate(response.submittedAt)}
                          </TableCell>
                          {form?.questions.map((question) => (
                            <TableCell key={question.id} className="max-w-[300px]">
                              <div className="truncate" title={getAnswerForQuestion(response, question.id)}>
                                {getAnswerForQuestion(response, question.id)}
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
