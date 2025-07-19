'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { 
  Plus, 
  FileText, 
  BarChart3, 
  Users, 
  LogOut, 
  Settings,
  ExternalLink,
  Calendar,
  MessageSquare 
} from 'lucide-react';

interface Form {
  _id: string;
  title: string;
  description?: string;
  questions: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/forms', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setForms(data.forms);
      } else {
        setError('Failed to fetch forms');
      }
    } catch (error) {
      setError('Error loading forms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">FeedbackPro</h1>
                <Badge variant="secondary">Admin Dashboard</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.name}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{forms.length}</div>
                <p className="text-xs text-muted-foreground">
                  {forms.filter(f => f.isActive).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {forms.filter(f => f.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Collecting responses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {forms.reduce((total, form) => total + form.questions.length, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all forms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Admin</div>
                <p className="text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 mb-8">
            <Link href="/dashboard/forms/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Form
              </Button>
            </Link>
            <Button variant="outline" onClick={fetchForms}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Forms List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Feedback Forms</CardTitle>
              <CardDescription>
                Manage your forms and view their responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : forms.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No forms yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first feedback form to start collecting responses
                  </p>
                  <Link href="/dashboard/forms/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Form
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {forms.map((form) => (
                    <div
                      key={form._id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {form.title}
                            </h3>
                            <Badge variant={form.isActive ? "default" : "secondary"}>
                              {form.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          {form.description && (
                            <p className="text-gray-600 mb-2">{form.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {form.questions.length} questions
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Created {formatDate(form.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/form/${form._id}`} target="_blank">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/dashboard/forms/${form._id}/responses`}>
                            <Button variant="outline" size="sm">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Responses
                            </Button>
                          </Link>
                          <Link href={`/dashboard/forms/${form._id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Settings className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
