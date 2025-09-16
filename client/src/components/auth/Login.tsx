import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, GraduationCap } from 'lucide-react';

interface LoginProps {
  onLoginSuccess?: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });

  // Email validation regex for college emails
  const collegeEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+(\.edu|\.ac\.|college\.edu)$/;

  const validateForm = () => {
    const newFieldErrors = {
      email: '',
      password: ''
    };

    // Email validation
    if (!formData.email) {
      newFieldErrors.email = 'College email is required';
    } else if (!collegeEmailRegex.test(formData.email) && !formData.email.includes('@college.edu') && !formData.email.includes('@student.college.edu')) {
      newFieldErrors.email = 'Please enter a valid college email address';
    }

    // Password validation
    if (!formData.password) {
      newFieldErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newFieldErrors.password = 'Password must be at least 6 characters long';
    }

    setFieldErrors(newFieldErrors);
    return !newFieldErrors.email && !newFieldErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      setFormData({ email: '', password: '' });
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
  };

  const handleInputChange = (field: 'email' | 'password') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Clear general error when user interacts
    if (error) {
      setError('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your timetable management account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General error */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email">College Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="student@college.edu"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={`pl-10 ${fieldErrors.email ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={`pl-10 ${fieldErrors.password ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Demo credentials helper */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-medium mb-2">Demo Credentials:</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Student:</strong> student1@student.college.edu</p>
              <p><strong>Faculty:</strong> dr.smith@college.edu</p>
              <p><strong>Password:</strong> password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}