'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { isValidEmail, isValidPassword } from '@/utils/validators';
import { ExamType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    targetYear: new Date().getFullYear() + 1,
  });
  const [examTargets, setExamTargets] = useState<ExamType[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isValidPassword(formData.password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and number');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (examTargets.length === 0) {
      setError('Please select at least one exam target');
      return;
    }

    try {
      setLoading(true);
      await register({
        ...formData,
        examTargets,
      });
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExam = (exam: ExamType) => {
    setExamTargets((prev) =>
      prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam]
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-base">
              Join thousands preparing for competitive exams
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password *</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Password *</label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9876543210"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Exams *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[ExamType.JEE_MAIN, ExamType.JEE_ADVANCED, ExamType.NEET, ExamType.BITSAT, ExamType.COMEDK].map((exam) => (
                    <Button
                      key={exam}
                      type="button"
                      variant={examTargets.includes(exam) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleExam(exam)}
                      className="justify-start"
                    >
                      {exam.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Year</label>
                <select
                  value={formData.targetYear}
                  onChange={(e) => setFormData({ ...formData, targetYear: Number(e.target.value) })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors"
                >
                  {[2025, 2026, 2027, 2028].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
