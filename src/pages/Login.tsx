import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-paper grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-10 bg-foreground text-background">
        <NavLink to="/" className="font-semibold tracking-tight">Lexicon.</NavLink>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight max-w-sm leading-tight">
            "Catalog copy, resolved — in seconds, not days."
          </h2>
          <div className="mt-4 text-xs font-mono text-background/60">— The Lexicon Team</div>
        </div>
        <div className="text-xs font-mono text-background/40">Editorial precision · v1.0</div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form
          onSubmit={(e) => { e.preventDefault(); nav("/app"); }}
          className="w-full max-w-sm flex flex-col gap-5"
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to continue to your workspace.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@company.com" required />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground">Forgot?</a>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="rounded-full">Sign in</Button>
          <div className="text-xs text-center text-muted-foreground">
            No account? <NavLink to="/signup" className="text-foreground font-medium underline-offset-4 hover:underline">Create one</NavLink>
          </div>
        </form>
      </div>
    </div>
  );
}
