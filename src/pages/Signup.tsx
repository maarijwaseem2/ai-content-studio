import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export default function Signup() {
  const nav = useNavigate();
  const setUser = useStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", { email, password });
      localStorage.setItem("access_token", data.access_token);
      setUser(data.user);
      toast.success("Account created!");
      nav("/app");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
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
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" name="confirm" type="password" required />
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
