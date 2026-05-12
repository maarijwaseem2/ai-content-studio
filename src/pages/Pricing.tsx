import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

const plans = [
  {
    name: "Free",
    price: "$0",
    credits: "20",
    saves: "1",
    export: "—",
    support: "Community",
    popular: false,
  },
  {
    name: "Starter",
    price: "$19",
    credits: "250",
    saves: "Unlimited",
    export: "TXT, DOC",
    support: "Email",
    popular: false,
  },
  {
    name: "Pro",
    price: "$49",
    credits: "1,000",
    saves: "Unlimited",
    export: "TXT, DOC, CSV",
    support: "Priority email",
    popular: true,
  },
  {
    name: "Business",
    price: "$149",
    credits: "5,000",
    saves: "Unlimited",
    export: "All + API",
    support: "Dedicated",
    popular: false,
  },
];

export default function Pricing() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);

  async function handleSubscribe(tier: string) {
    if (!user) {
      toast.error("Please login to subscribe.");
      return;
    }
    try {
      await api.post("/user/subscribe", { tier });
      toast.success(
        `Subscription request for ${tier} sent! Please follow the instructions below.`,
      );
    } catch (e) {
      toast.error("Request failed.");
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-[1280px] mx-auto">
      <div className="text-center mb-12">
        <div className="label-eyebrow mb-2">Plans & credits</div>
        <h1 className="text-4xl font-semibold tracking-tight">
          Choose Your Plan
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
          After requesting a plan, please send the payment to the account below.
          Your credits will be added once our team verifies the payment.
        </p>

        <div className="mt-8 p-4 rounded-xl bg-highlight/10 border border-highlight/20 inline-block text-left">
          <div className="text-xs font-mono uppercase tracking-widest text-highlight mb-2">
            Payment Details
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Bank:</span> National Bank
            of Pakistan <br />
            <span className="text-muted-foreground">IBAN:</span> PK76 NBPA 0000
            1234 5678 9012 <br />
            <span className="text-muted-foreground">Account Name:</span> Lexicon
            Business Solutions
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 italic">
            * Please mention your email in the payment reference.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`surface-card p-7 flex flex-col gap-5 relative ${p.popular ? "ring-2 ring-foreground" : ""}`}
          >
            {p.popular && (
              <div className="absolute -top-2.5 left-6 px-2.5 py-0.5 bg-foreground text-background text-[10px] font-mono uppercase tracking-widest rounded">
                Most popular
              </div>
            )}
            <div>
              <div className="text-sm font-medium">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">
                  {p.price}
                </span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm">
              <Row label="Monthly credits" value={p.credits} />
              <Row label="Saved content" value={p.saves} />
              <Row label="Export formats" value={p.export} />
              <Row label="Support" value={p.support} />
            </ul>
            <Button
              onClick={() => handleSubscribe(p.name)}
              variant={p.popular ? "default" : "outline"}
              className="rounded-full mt-auto"
            >
              Request {p.name}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="size-4 mt-0.5 text-highlight shrink-0" />
      <div className="flex-1 flex justify-between gap-2">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-right">{value}</span>
      </div>
    </li>
  );
}
