import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import api from "@/lib/api";
import { isValidEmail } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Mail, ShieldCheck, KeyRound } from "lucide-react";

type Step = "request" | "verify" | "reset";

export default function ForgotPassword() {
  const nav = useNavigate();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [issuedOtp, setIssuedOtp] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setIssuedOtp(data.otp);
      setStep("verify");
      toast.success("OTP generated", {
        description: `For demo: your OTP is ${data.otp}`,
        duration: 10000,
      });
      window.setTimeout(() => {
        window.alert(`Your OTP is: ${data.otp}\n\nValid for 10 minutes.`);
      }, 250);
    } catch (err: any) {
      if (!err?.response) {
        toast.error("Cannot reach server. Please try again.");
      } else {
        toast.error(err.response?.data?.message || "Could not send OTP");
      }
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { email, otp });
      setStep("reset");
      toast.success("OTP verified. Set a new password.");
    } catch (err: any) {
      if (!err?.response) {
        toast.error("Cannot reach server. Please try again.");
      } else {
        toast.error(err.response?.data?.message || "Invalid OTP");
      }
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      toast.success("Password reset! Please sign in.");
      nav("/login");
    } catch (err: any) {
      if (!err?.response) {
        toast.error("Cannot reach server. Please try again.");
      } else {
        toast.error(err.response?.data?.message || "Reset failed");
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
            Forgot your password? Reset it in seconds.
          </h2>
          <p className="mt-4 text-sm text-background/70 max-w-sm">
            We'll generate a one-time code so you can set a new password safely.
          </p>
        </div>
        <div className="text-xs font-mono text-background/40">
          Account recovery · v1.0
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm flex flex-col gap-5">
          <NavLink
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="size-3.5" /> Back to sign in
          </NavLink>

          <Stepper step={step} />

          {step === "request" && (
            <form onSubmit={requestOtp} className="flex flex-col gap-4" noValidate>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Reset password
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your account email to receive a code.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="rounded-full">
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={verifyOtp} className="flex flex-col gap-4" noValidate>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Enter OTP
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Code sent for <span className="font-medium">{email}</span>.
                  It expires in 10 minutes.
                </p>
              </div>

              {issuedOtp && (
                <div className="rounded-md border border-highlight/40 bg-highlight/10 px-3 py-2.5 text-xs">
                  <div className="label-eyebrow mb-1">Demo OTP</div>
                  <div className="font-mono text-base font-semibold tracking-[0.3em]">
                    {issuedOtp}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Shown here because we don't send real emails in this demo.
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 items-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(v) => setOtp(v)}
                >
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button type="submit" disabled={loading} className="rounded-full">
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <button
                type="button"
                onClick={requestOtp as any}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Resend OTP
              </button>
            </form>
          )}

          {step === "reset" && (
            <form
              onSubmit={resetPassword}
              className="flex flex-col gap-4"
              noValidate
            >
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  New password
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a strong password you'll remember.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="new">New password</Label>
                <PasswordInput
                  id="new"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <PasswordInput
                  id="confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="rounded-full">
                {loading ? "Saving..." : "Reset password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const items = [
    { id: "request", label: "Email", icon: Mail },
    { id: "verify", label: "OTP", icon: ShieldCheck },
    { id: "reset", label: "Password", icon: KeyRound },
  ] as const;
  const idx = items.findIndex((i) => i.id === step);

  return (
    <div className="flex items-center gap-2">
      {items.map((item, i) => {
        const Icon = item.icon;
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={item.id} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : done
                    ? "border-highlight/40 bg-highlight/10 text-foreground"
                    : "border-border text-muted-foreground"
              }`}
            >
              <Icon className="size-3" />
              {item.label}
            </div>
            {i < items.length - 1 && (
              <div className="flex-1 h-px bg-border" />
            )}
          </div>
        );
      })}
    </div>
  );
}
