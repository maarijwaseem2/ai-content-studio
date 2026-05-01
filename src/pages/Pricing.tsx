import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  { name: "Free", price: "$0", credits: "20", saves: "1", export: "—", support: "Community", popular: false },
  { name: "Starter", price: "$19", credits: "250", saves: "Unlimited", export: "TXT, DOC", support: "Email", popular: false },
  { name: "Pro", price: "$49", credits: "1,000", saves: "Unlimited", export: "TXT, DOC, CSV", support: "Priority email", popular: true },
  { name: "Business", price: "$149", credits: "5,000", saves: "Unlimited", export: "All + API", support: "Dedicated", popular: false },
];

export default function Pricing() {
  return (
    <div className="p-6 md:p-10 max-w-[1280px] mx-auto">
      <div className="text-center mb-12">
        <div className="label-eyebrow mb-2">Plans & credits</div>
        <h1 className="text-4xl font-semibold tracking-tight">Pick a plan that scales with you.</h1>
        <p className="text-sm text-muted-foreground mt-2">Each generation uses one credit. Cancel any time.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => (
          <div key={p.name} className={`surface-card p-7 flex flex-col gap-5 relative ${p.popular ? "ring-2 ring-foreground" : ""}`}>
            {p.popular && (
              <div className="absolute -top-2.5 left-6 px-2.5 py-0.5 bg-foreground text-background text-[10px] font-mono uppercase tracking-widest rounded">
                Most popular
              </div>
            )}
            <div>
              <div className="text-sm font-medium">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm">
              <Row label="Monthly credits" value={p.credits} />
              <Row label="Saved content" value={p.saves} />
              <Row label="Export formats" value={p.export} />
              <Row label="Support" value={p.support} />
            </ul>
            <Button variant={p.popular ? "default" : "outline"} className="rounded-full mt-auto">
              Choose {p.name}
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
