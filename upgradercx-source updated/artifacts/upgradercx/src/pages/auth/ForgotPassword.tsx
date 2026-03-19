import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, MailCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');

  const validate = () => {
    if (!email.trim()) { setFieldError('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError('Enter a valid email'); return false; }
    setFieldError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Check your email</CardTitle>
          <CardDescription>
            We sent a password reset link to <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2">
          <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
            Try another email
          </Button>
          <Link to="/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Forgot password?</CardTitle>
        <CardDescription>Enter your email and we'll send you a reset link.</CardDescription>
      </CardHeader>

      {error && (
        <div className="px-6">
          <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setFieldError(''); }} aria-invalid={!!fieldError} className={fieldError ? 'border-destructive' : ''} />
            {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
          </Button>
          <Link to="/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
