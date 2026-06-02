import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";
import api from "@/lib/api";
import { isValidEmail } from "@/lib/utils";
import { toast } from "sonner";

export default function Signup() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", { email, password });
      if (data?.requiresVerification) {
        toast.success("Account created — verify your OTP to continue");
        nav("/verify-account", {
          state: { email: data.email, otp: data.otp },
        });
        return;
      }
      toast.success("Account created!");
      nav("/login");
    } catch (err: any) {
      if (!err?.response) {
        toast.error("Cannot reach server. Please try again.");
      } else {
        toast.error(err.response?.data?.message || "Something went wrong");
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
            Start with 250 free credits. No card required.
          </h2>
          <ul className="mt-6 flex flex-col gap-2 text-sm text-background/70">
            <li>· All tones, all languages</li>
            <li>· English, Roman Urdu, Urdu</li>
            <li>· Save and export your best work</li>
          </ul>
        </div>
        <div className="text-xs font-mono text-background/40">
          Editorial precision · v1.0
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm flex flex-col gap-4"
          noValidate
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Five seconds. Then start generating.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <PasswordInput
              id="confirm"
              name="confirm"
              autoComplete="new-password"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-full mt-2"
          >
            {loading ? "Creating..." : "Create account"}
          </Button>
          <div className="text-xs text-center text-muted-foreground">
            Already registered?{" "}
            <NavLink
              to="/login"
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              Sign in
            </NavLink>
          </div>
        </form>
      </div>
    </div>
  );
}
