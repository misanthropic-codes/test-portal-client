'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockTestService } from '@/services/mock/mockData';
import { Test } from '@/types';
import Link from 'next/link';
import { formatExamType, formatTestType, formatDifficulty } from '@/utils/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, FileText, User, LogOut, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTest = async () => {
      try {
        const testId = params.testId as string;
        const data = await mockTestService.getTestById(testId);
        setTest(data);
      } catch (error) {
        console.error('Error loading test:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [params.testId]);

  const handleStartTest = async () => {
    if (!test) return;
    
    try {
      const attempt = await mockTestService.startTest(test.id);
      router.push(`/test/${attempt.id}`);
    } catch (error) {
      console.error('Error starting test:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Test Not Found</h3>
            <p className="text-muted-foreground mb-6">
              The test you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/tests">Browse Tests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-bold text-xl">
              Test Portal
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/tests" className="text-foreground hover:text-primary transition-colors">
                Tests
              </Link>
              <Link href="/analytics" className="text-muted-foreground hover:text-foreground transition-colors">
                Analytics
              </Link>
              <Link href="/history" className="text-muted-foreground hover:text-foreground transition-colors">
                History
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/tests">← Back to Tests</Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Test Header */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="default">{formatExamType(test.examType)}</Badge>
                  <Badge variant="outline">{formatTestType(test.testType)}</Badge>
                  <Badge variant="secondary">{formatDifficulty(test.difficulty)}</Badge>
                </div>
                <CardTitle className="text-2xl">{test.title}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {test.description}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Test Details */}
            <Card>
              <CardHeader>
                <CardTitle>Test Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-lg font-semibold">{test.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Questions</p>
                    <p className="text-lg font-semibold">{test.totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Marks</p>
                    <p className="text-lg font-semibold">{test.totalMarks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Marking Scheme</p>
                    <p className="text-sm">+{test.positiveMarks} / {test.negativeMarks}</p>
                  </div>
                </div>

                {test.attemptsCount > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Attempts</p>
                        <p className="text-lg font-semibold">{test.attemptsCount}</p>
                      </div>
                      {test.averageScore && (
                        <div>
                          <p className="text-sm text-muted-foreground">Average Score</p>
                          <p className="text-lg font-semibold">{test.averageScore.toFixed(1)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sections */}
            {test.sections && test.sections.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {test.sections.map((section, index) => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div>
                          <h4 className="font-semibold">{section.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {section.questionCount} Questions • {section.totalMarks} Marks
                          </p>
                        </div>
                        {section.duration && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {section.duration} min
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc list-inside text-sm">
                  <li>Ensure stable internet connection before starting</li>
                  <li>The test will auto-submit when time expires</li>
                  <li>You can mark questions for review and come back later</li>
                  <li>Negative marking: {test.negativeMarks} for wrong answers</li>
                  <li>Calculator and rough sheets are not allowed</li>
                  <li>Once submitted, you cannot reattempt the test</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Start Test Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Ready to Start?</CardTitle>
                <CardDescription>
                  Make sure you have enough time to complete the test
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{test.duration} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Questions</span>
                    <span className="font-medium">{test.totalQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Marks</span>
                    <span className="font-medium">{test.totalMarks}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleStartTest}
                >
                  Start Test Now
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By starting, you agree to complete the test in one sitting
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Verified Test</p>
                    <p className="text-xs text-muted-foreground">Quality assured</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-chart-2" />
                  <div>
                    <p className="text-sm font-medium">{test.attemptsCount || 0} Students</p>
                    <p className="text-xs text-muted-foreground">Have attempted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
