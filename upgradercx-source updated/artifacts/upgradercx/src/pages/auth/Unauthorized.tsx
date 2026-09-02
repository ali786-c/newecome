import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg text-center">
        <CardHeader className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Access Denied</CardTitle>
          <CardDescription className="leading-relaxed">
            You don't have permission to view this page. If you believe this is an error, contact your administrator.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>Go Back</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
