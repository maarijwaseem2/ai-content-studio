import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Store, ShoppingCart, Instagram, Facebook, Globe, ListChecks } from "lucide-react";

const templates = [
  { id: "ecom", name: "E-commerce product description", desc: "Long-form description for general DTC stores.", icon: ShoppingBag, slug: "ecom" },
  { id: "shopify", name: "Shopify product page", desc: "Optimized headline, body, and bullets for Shopify themes.", icon: Store, slug: "shopify" },
  { id: "amazon", name: "Amazon style listing", desc: "Title + 5 keyword-loaded bullets, A+ tone.", icon: ShoppingCart, slug: "amazon" },
  { id: "ig", name: "Instagram product caption", desc: "Punchy captions with hashtags and emojis.", icon: Instagram, slug: "ig" },
  { id: "fb", name: "Facebook ad copy", desc: "Short scroll-stopping primary text + headline.", icon: Facebook, slug: "fb" },
  { id: "seo", name: "SEO category content", desc: "Meta title and description for category pages.", icon: Globe, slug: "seo" },
  { id: "highlights", name: "Short product highlights", desc: "Just the bullets — perfect for above-the-fold.", icon: ListChecks, slug: "highlights" },
  { id: "luxury", name: "Luxury narrative", desc: "Refined, editorial tone for premium brands.", icon: ShoppingBag, slug: "luxury" },
];

export default function Templates() {
  return (
    <div className="p-6 md:p-10 max-w-[1280px] mx-auto">
      <div className="mb-8">
        <div className="label-eyebrow mb-1">Library</div>
        <h1 className="text-3xl font-semibold tracking-tight">Templates</h1>
        <p className="text-sm text-muted-foreground mt-1">Start from a structured prompt for common use cases.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t) => (
          <div key={t.id} className="surface-card p-6 flex flex-col gap-4 group">
            <div className="flex items-start justify-between">
              <div className="size-10 rounded-lg bg-secondary flex items-center justify-center">
                <t.icon className="size-4" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Template</span>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold tracking-tight">{t.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t.desc}</p>
            </div>
            <Button asChild variant="outline" className="rounded-full mt-2">
              <NavLink to={`/app/generate?template=${t.slug}`}>Use template</NavLink>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
