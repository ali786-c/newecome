import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authApi } from '@/api/auth.api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const emailParam = params.get('email') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [form, setForm] = useState({ email: emailParam, password: '', password_confirmation: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.password_confirmation) e.password_confirmation = 'Passwords do not match';
    if (!token) e.token = 'Invalid or missing reset token';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setIsLoading(true);
    try {
      // Laravel expects: token, email, password, password_confirmation
      await authApi.resetPassword({ token, ...form });
      setSuccess(true);
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Could not reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Password reset</CardTitle>
          <CardDescription>Your password has been updated. You can now sign in.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" onClick={() => navigate('/login')}>Go to Login</Button>
        </CardFooter>
      </Card>
    );
  }

  const PasswordToggle = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground" onClick={toggle} tabIndex={-1}>
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </Button>
  );

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Reset your password</CardTitle>
        <CardDescription>Choose a new password for your account.</CardDescription>
      </CardHeader>

      {serverError && (
        <div className="px-6">
          <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{serverError}</AlertDescription></Alert>
        </div>
      )}
      {errors.token && (
        <div className="px-6">
          <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{errors.token}</AlertDescription></Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={update('email')} aria-invalid={!!errors.email} className={errors.email ? 'border-destructive' : ''} />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={update('password')} aria-invalid={!!errors.password} className={errors.password ? 'border-destructive pr-10' : 'pr-10'} />
              <PasswordToggle show={showPassword} toggle={() => setShowPassword(!showPassword)} />
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirmation">Confirm Password</Label>
            <div className="relative">
              <Input id="password_confirmation" type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={form.password_confirmation} onChange={update('password_confirmation')} aria-invalid={!!errors.password_confirmation} className={errors.password_confirmation ? 'border-destructive pr-10' : 'pr-10'} />
              <PasswordToggle show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
            </div>
            {errors.password_confirmation && <p className="text-sm text-destructive">{errors.password_confirmation}</p>}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
          <Link to="/login" className="text-sm text-primary hover:underline">Back to login</Link>
        </CardFooter>
      </form>
    </Card>
  );
}
