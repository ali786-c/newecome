import { Outlet, Link } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8 flex items-center gap-2.5">
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            U
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">UpgraderCX</span>
        </Link>
      </div>
      <div className="w-full max-w-md animate-fade-in">
        <Outlet />
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} UpgraderCX. All rights reserved.
      </p>
    </div>
  );
}
