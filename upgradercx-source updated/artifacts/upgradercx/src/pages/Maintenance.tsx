import { ShieldAlert, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Maintenance() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 shadow-2xl">
          <ShieldAlert className="h-12 w-12 text-primary" />
        </div>
      </div>
      
      <h1 className="mb-2 text-4xl font-black tracking-tight sm:text-5xl">
        Scheduled <span className="text-primary italic">Maintenance</span>
      </h1>
      
      <p className="mx-auto mb-8 max-w-lg text-lg text-muted-foreground leading-relaxed">
        We're currently performing some important updates to make your experience even better. 
        We'll be back online very soon.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-sm mb-12">
        <div className="flex flex-col items-center p-4 rounded-2xl bg-muted/30 border border-muted/60">
          <Clock className="h-6 w-6 text-primary mb-2" />
          <span className="text-sm font-semibold">Estimated Time</span>
          <span className="text-xs text-muted-foreground">30-60 minutes</span>
        </div>
        <div className="flex flex-col items-center p-4 rounded-2xl bg-muted/30 border border-muted/60">
          <RefreshCw className="h-6 w-6 text-primary mb-2 animate-spin-slow" />
          <span className="text-sm font-semibold">Live Status</span>
          <span className="text-xs text-muted-foreground">Updating Core Systems</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" className="rounded-full px-8" onClick={() => window.location.reload()}>
          Check Status <RefreshCw className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
          <a href="/contact">Contact Support</a>
        </Button>
      </div>

      <footer className="mt-20 text-xs text-muted-foreground font-medium uppercase tracking-widest">
        &copy; {new Date().getFullYear()} UpgraderCX. All Rights Reserved.
      </footer>
    </div>
  );
}
