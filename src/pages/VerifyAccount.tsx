import { useEffect, useState } from "react";
import {
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import api from "@/lib/api";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { ArrowLeft, MailCheck, ShieldCheck } from "lucide-react";

interface LocationState {
  email?: string;
  otp?: string;
  fromLogin?: boolean;
}

export default function VerifyAccount() {
  const nav = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const setUser = useStore((s) => s.setUser);

  const state = (location.state as LocationState) || {};
  const initialEmail = state.email || params.get("email") || "";
  const initialOtp = state.otp || params.get("otp") || "";

  const [email] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [issuedOtp, setIssuedOtp] = useState<string | null>(
    initialOtp || null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("No email to verify. Please sign up or sign in again.");
      nav("/login");
      return;
    }
    if (initialOtp) {
      window.setTimeout(() => {
        window.alert(
          `Your verification OTP: ${initialOtp}\n\nValid for 10 minutes.`,
        );
      }, 200);
    }
  }, [email, initialOtp, nav]);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-signup", { email, otp });
      if (data?.access_token && data?.user) {
        localStorage.setItem("access_token", data.access_token);
        setUser(data.user);
        toast.success("Account verified. Welcome!");
        nav("/app");
      } else if (data?.alreadyVerified) {
        toast.info("Account already verified. Please sign in.");
        nav("/login");
      } else {
        toast.success("Verified. Please sign in.");
        nav("/login");
      }
    } catch (err: any) {
      if (!err?.response) {
        toast.error("Cannot reach server. Please try again.");
      } else {
        toast.error(err.response?.data?.message || "Verification failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/resend-signup-otp", { email });
      setIssuedOtp(data.otp);
      toast.success("New OTP issued", {
        description: `Demo OTP: ${data.otp}`,
        duration: 10000,
      });
      window.setTimeout(() => {
        window.alert(
          `Your new verification OTP: ${data.otp}\n\nValid for 10 minutes.`,
        );
      }, 200);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not resend OTP");
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/10 text-xs font-mono text-background/80 mb-4">
            <ShieldCheck className="size-3.5" />
            Verification required
          </div>
          <h2 className="text-3xl font-semibold tracking-tight max-w-sm leading-tight">
            One last step — verify your email to unlock your account.
          </h2>
          <p className="mt-4 text-sm text-background/70 max-w-sm">
            Your account stays pending until you confirm the OTP. This keeps
            things safe for everyone.
          </p>
        </div>
        <div className="text-xs font-mono text-background/40">
          Account verification · v1.0
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

          <div>
            <div className="inline-flex items-center gap-2 size-10 rounded-lg bg-foreground/5 justify-center mb-3">
              <MailCheck className="size-4 text-foreground" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Verify your account
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the 6-digit code we issued for{" "}
              <span className="font-medium text-foreground">{email}</span>.
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

          <form onSubmit={verify} className="flex flex-col gap-4" noValidate>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={(v) => setOtp(v)}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button type="submit" disabled={loading} className="rounded-full">
              {loading ? "Verifying..." : "Verify & continue"}
            </Button>

            <button
              type="button"
              onClick={resend}
              disabled={loading}
              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Didn't get a code? Resend OTP
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
