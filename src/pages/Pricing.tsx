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
    saves: "1 saved item",
    languages: "English only",
    support: "Community",
    popular: false,
  },
  {
    name: "Starter",
    price: "$19",
    credits: "250",
    saves: "Unlimited",
    languages: "All 16 languages",
    support: "Email",
    popular: false,
  },
  {
    name: "Pro",
    price: "$49",
    credits: "1,000",
    saves: "Unlimited",
    languages: "All 16 languages",
    support: "Priority email",
    popular: true,
  },
  {
    name: "Business",
    price: "$149",
    credits: "5,000",
    saves: "Unlimited",
    languages: "All 16 languages",
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
        <h1 className="text-4xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
          Request a plan and our team will reach out with secure payment
          instructions. Your credits are added as soon as payment is verified.
        </p>

        <div className="mt-8 p-4 rounded-xl bg-secondary/40 border border-border inline-block text-left max-w-md">
          <div className="text-xs font-mono uppercase tracking-widest text-foreground/80 mb-1">
            How it works
          </div>
          <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-0.5">
            <li>Click <span className="font-medium text-foreground">Request</span> on the plan you want.</li>
            <li>Our team contacts you with payment options.</li>
            <li>Credits are added once payment is confirmed.</li>
          </ol>
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
              <Row label="Languages" value={p.languages} />
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
