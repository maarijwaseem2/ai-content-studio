import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";
import api from "@/lib/api";
import { useStore } from "@/lib/store";
import { isValidEmail } from "@/lib/utils";
import { toast } from "sonner";

export default function Login() {
  const nav = useNavigate();
  const setUser = useStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data?.requiresVerification) {
        toast.info("Verify your account to continue");
        nav("/verify-account", {
          state: { email: data.email, otp: data.otp, fromLogin: true },
        });
        return;
      }
      localStorage.setItem("access_token", data.access_token);
      setUser(data.user);
      toast.success("Welcome back!");
      nav("/app");
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (!err?.response) {
        toast.error("Cannot reach server. Please try again.");
      } else if (status === 401) {
        toast.error("Invalid email or password");
      } else if (status === 403) {
        toast.error(msg || "Account is not accessible");
      } else {
        toast.error(msg || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-10 bg-foreground text-background">
        <NavLink to="/" className="font-semibold tracking-tight">
          Lexicon.
        </NavLink>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight max-w-sm leading-tight">
            "Catalog copy, resolved — in seconds, not days."
          </h2>
          <div className="mt-4 text-xs font-mono text-background/60">
            — The Lexicon Team
          </div>
        </div>
        <div className="text-xs font-mono text-background/40">
          Editorial precision · v1.0
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm flex flex-col gap-5"
          noValidate
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to continue to your workspace.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <NavLink
                to="/forgot-password"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Forgot?
              </NavLink>
            </div>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="rounded-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <div className="text-xs text-center text-muted-foreground">
            No account?{" "}
            <NavLink
              to="/signup"
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              Create one
            </NavLink>
          </div>
        </form>
      </div>
    </div>
  );
}
