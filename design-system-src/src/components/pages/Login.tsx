import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { Button } from '../admin/Button';
import { FormInput } from '../admin/FormInput';
import { ErrorBanner } from '../admin/ErrorBanner';

interface LoginProps {
  onLogin?: (email: string, password: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Mock validation - replace with actual auth logic
      if (email === 'admin@haunted.com' && password === 'password') {
        onLogin?.(email, password);
      } else {
        setError('Login failed. Please check your credentials.');
        setFieldError('Incorrect email or password.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--blue-electric)] opacity-5 blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--blue-electric)] opacity-5 blur-3xl rounded-full" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] mb-4">
            <Lock className="w-8 h-8 text-[var(--blue-electric)]" />
          </div>
          <h1 className="mb-2">Haunted Admin</h1>
          <p style={{ fontSize: 'var(--text-secondary)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-secondary)', color: 'var(--text-muted)' }}>Internal admin access only</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6">
            <ErrorBanner message={error} onDismiss={() => setError('')} />
          </div>
        )}

        {/* Login Form */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <FormInput
                type="email"
                label="Email"
                placeholder="admin@haunted.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10"
              />
              <Mail className="absolute left-3 top-[38px] w-5 h-5 text-[var(--text-muted)]" />
            </div>

            {/* Password Input */}
            <div className="relative">
              <FormInput
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                error={fieldError}
                className="pl-10 pr-10"
              />
              <Lock className="absolute left-3 top-[38px] w-5 h-5 text-[var(--text-muted)]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log in'
              )}
            </Button>
          </form>
        </div>

        {/* Dev Credentials Helper */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg p-4 mt-4">
          <p className="text-xs text-[var(--text-muted)] mb-2">Demo Credentials:</p>
          <div className="space-y-1">
            <p className="text-xs font-mono text-[var(--blue-electric)]">Email: admin@haunted.com</p>
            <p className="text-xs font-mono text-[var(--blue-electric)]">Password: password</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-[var(--text-muted)]">
            Haunted Family © 2024 • Internal Use Only
          </p>
        </div>
      </div>
    </div>
  );
}
