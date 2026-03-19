import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const sessionExpired = new URLSearchParams(location.search).get('expired') === '1';

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setIsLoading(true);
    try {
      const loggedInUser = await login({ email, password });
      if (rememberMe) localStorage.setItem('remember_me', '1');
      const defaultPath = loggedInUser.role === 'admin' ? '/admin' : '/dashboard';
      const target = from === '/dashboard' ? defaultPath : from;
      navigate(target, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid email or password';
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription>Sign in to your UpgraderCX account</CardDescription>
      </CardHeader>

      {sessionExpired && (
        <div className="px-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Your session has expired. Please sign in again.</AlertDescription>
          </Alert>
        </div>
      )}

      {serverError && (
        <div className="px-6 pt-2">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
              aria-invalid={!!errors.email} className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Input
                id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                aria-invalid={!!errors.password} className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
              />
              <Button
                type="button" variant="ghost" size="icon"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="remember" checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} />
            <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">Remember me</Label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">Create one</Link>
          </p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Admin: admin@example.com / password</p>
            <p>Customer: user@example.com / password</p>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
