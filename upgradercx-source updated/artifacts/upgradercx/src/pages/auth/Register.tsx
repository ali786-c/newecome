import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { registerSchema } from '@/lib/schemas/register.schema';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [serverError, setServerError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const result = registerSchema.safeParse({ ...form, agreeTerms });
    if (result.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const key = issue.path[0] as string;
      if (key === 'agreeTerms') fieldErrors.terms = issue.message;
      else if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    });
    setErrors(fieldErrors);
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register(form);
      toast({ title: 'Account created', description: 'Please sign in with your credentials.' });
      navigate('/login');
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Could not create account');
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordToggle = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground" onClick={toggle} tabIndex={-1}>
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </Button>
  );

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
        <CardDescription>Sign up to start using UpgraderCX</CardDescription>
      </CardHeader>

      {serverError && (
        <div className="px-6">
          <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{serverError}</AlertDescription></Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" value={form.name} onChange={update('name')} aria-invalid={!!errors.name} className={errors.name ? 'border-destructive' : ''} />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} aria-invalid={!!errors.email} className={errors.email ? 'border-destructive' : ''} />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={update('password')} aria-invalid={!!errors.password} className={errors.password ? 'border-destructive pr-10' : 'pr-10'} />
              <PasswordToggle show={showPassword} toggle={() => setShowPassword(!showPassword)} />
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            {form.password && (
              <ul className="space-y-1 pt-1">
                {PASSWORD_RULES.map((r) => (
                  <li key={r.label} className={`flex items-center gap-1.5 text-xs ${r.test(form.password) ? 'text-primary' : 'text-muted-foreground'}`}>
                    <Check className="h-3 w-3" /> {r.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirmation">Confirm Password</Label>
            <div className="relative">
              <Input id="password_confirmation" type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={form.password_confirmation} onChange={update('password_confirmation')} aria-invalid={!!errors.password_confirmation} className={errors.password_confirmation ? 'border-destructive pr-10' : 'pr-10'} />
              <PasswordToggle show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
            </div>
            {errors.password_confirmation && <p className="text-sm text-destructive">{errors.password_confirmation}</p>}
          </div>

          <div className="flex items-start gap-2">
            <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(v) => { setAgreeTerms(!!v); setErrors((p) => ({ ...p, terms: '' })); }} className="mt-0.5" />
            <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-snug">
              I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </Label>
          </div>
          {errors.terms && <p className="text-sm text-destructive -mt-2">{errors.terms}</p>}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
