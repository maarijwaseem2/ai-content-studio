import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Sparkles, Type, Hash, ListChecks, Megaphone } from "lucide-react";

const features = [
  { icon: Type, title: "Product descriptions", body: "Long-form, narrative copy that converts." },
  { icon: Hash, title: "SEO meta titles", body: "Keyword-aware titles under 60 characters." },
  { icon: Sparkles, title: "Meta descriptions", body: "Compelling 155-char snippets for search." },
  { icon: ListChecks, title: "Bullet points", body: "Scannable highlights for product pages." },
  { icon: Megaphone, title: "Ad copy", body: "Short-form variants for Meta, Google, TikTok." },
];

const plans = [
  { name: "Free", price: "$0", credits: "20", popular: false, perks: ["20 credits / month", "1 saved doc", "Basic tones"] },
  { name: "Starter", price: "$19", credits: "250", popular: true, perks: ["250 credits / month", "Unlimited saves", "All tones & languages", "TXT / DOC export"] },
  { name: "Pro", price: "$49", credits: "1,000", popular: false, perks: ["1,000 credits / month", "Brand voice memory", "Priority generation", "Email support"] },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper text-foreground">
      {/* Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-5 py-2.5 frosted rounded-full">
        <NavLink to="/" className="font-semibold tracking-tight text-sm">Lexicon.</NavLink>
        <div className="hidden md:flex gap-5 text-xs text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </div>
        <div className="w-px h-4 bg-border-strong" />
        <NavLink to="/login" className="text-xs font-medium hover:opacity-70">Sign in</NavLink>
        <Button asChild size="sm" className="rounded-full h-7 text-xs">
          <NavLink to="/signup">Get started</NavLink>
        </Button>
      </nav>

      {/* Hero */}
      <header className="pt-40 pb-20 px-6 max-w-3xl mx-auto text-center flex flex-col gap-6">
        <div className="inline-flex self-center items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface/60 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          <span className="size-1.5 rounded-full bg-highlight animate-pulse" />
          AI Engine v1.0 — Online
        </div>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-balance leading-[1.05]">
          Generate product descriptions in seconds.
        </h1>
        <p className="text-lg text-muted-foreground text-pretty max-w-[52ch] mx-auto leading-relaxed">
          Hand off raw specifications. Receive publish-ready, tone-perfect descriptions, SEO meta, bullet points, and ad copy — instantly.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild size="lg" className="rounded-full">
            <NavLink to="/signup">Start generating <ArrowRight className="size-4" /></NavLink>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <a href="#features">See how it works</a>
          </Button>
        </div>
      </header>

      {/* App Preview */}
      <section className="px-6 max-w-[1200px] mx-auto">
        <div className="surface-card overflow-hidden flex flex-col md:flex-row min-h-[480px]">
          <div className="flex-1 p-8 border-r border-border">
            <div className="label-eyebrow mb-4">Raw specifications</div>
            <div className="font-mono text-sm leading-relaxed text-muted-foreground bg-paper/60 border border-border-strong rounded-lg p-4">
              Product: Lounge Chair<br />
              Name: Koto<br />
              Material: Solid ash, boucle fabric.<br />
              Vibe: relaxed, sturdy, low profile.<br />
              Notes: stain-resistant fabric.
            </div>
          </div>
          <div className="flex-1 p-8 bg-paper/40">
            <div className="flex justify-between items-baseline mb-4">
              <div className="label-eyebrow">Refined narrative</div>
              <span className="text-xs text-muted-foreground font-mono">52 words</span>
            </div>
            <p className="text-base leading-relaxed text-pretty">
              The Koto Lounge Chair anchors your space with quiet, grounded authority. Crafted with a solid ash wood frame in a natural finish, its low-profile silhouette is softened by tactile oatmeal boucle upholstery — designed for lingering, the stain-resistant fabric keeps it as enduringly practical as it is visually calm.
            </p>
            <div className="mt-6 p-3 rounded-lg bg-surface/60 border border-border text-xs text-muted-foreground flex gap-2 items-start">
              <span className="size-2 mt-1 rounded-full bg-highlight shrink-0" />
              <span>Tone matched · 340 chars · SEO-ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mt-32 max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="label-eyebrow mb-3">Everything you need</div>
          <h2 className="text-4xl font-semibold tracking-tight">One brief. Six outputs.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="surface-card p-6 flex flex-col gap-3 hover:-translate-y-0.5 transition-transform">
              <div className="size-10 rounded-lg bg-secondary flex items-center justify-center">
                <f.icon className="size-5" />
              </div>
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mt-32 max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="label-eyebrow mb-3">Workflow</div>
          <h2 className="text-4xl font-semibold tracking-tight">Four steps. Zero friction.</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {["Add product details", "Choose tone", "Generate content", "Copy or save"].map((step, i) => (
            <div key={step} className="surface-card p-6">
              <div className="font-mono text-xs text-highlight mb-3">[ STEP {i + 1} ]</div>
              <div className="text-base font-medium">{step}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mt-32 max-w-[1200px] mx-auto px-6 grid md:grid-cols-3 gap-4">
        {[
          { q: "Cut our copywriting time by 90%. The tone control is unreal.", a: "Maya O., DTC Founder" },
          { q: "Finally an AI tool that doesn't sound like an AI tool.", a: "James L., E-comm Manager" },
          { q: "Roman Urdu support is a game-changer for our market.", a: "Asad K., Marketing Lead" },
        ].map((t) => (
          <div key={t.a} className="surface-card p-6">
            <p className="text-base leading-relaxed text-pretty mb-4">&ldquo;{t.q}&rdquo;</p>
            <div className="text-xs text-muted-foreground font-mono">— {t.a}</div>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section id="pricing" className="mt-32 max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="label-eyebrow mb-3">Pricing</div>
          <h2 className="text-4xl font-semibold tracking-tight">Simple, credit-based.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p.name} className={`surface-card p-8 flex flex-col gap-5 relative ${p.popular ? "ring-1 ring-foreground" : ""}`}>
              {p.popular && (
                <div className="absolute -top-2 left-6 px-2 py-0.5 bg-foreground text-background text-[10px] font-mono uppercase tracking-widest rounded">
                  Recommended
                </div>
              )}
              <div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
              </div>
              <ul className="flex flex-col gap-2 text-sm">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <Check className="size-4 mt-0.5 text-highlight shrink-0" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant={p.popular ? "default" : "outline"} className="rounded-full mt-auto">
                <NavLink to="/signup">Choose {p.name}</NavLink>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-32 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <div>© 2026 Lexicon. Crafted for catalog teams.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
