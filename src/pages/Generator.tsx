import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GeneratedContent,
  GenerateInput,
  TONES,
  LENGTHS,
  LANGUAGES,
  Tone,
  Length,
  Language,
} from "@/lib/mockGenerator";
import { useStore } from "@/lib/store";
import api from "@/lib/api";
import { Copy, RefreshCw, Save, Sparkles, Pencil, Check } from "lucide-react";
import { toast } from "sonner";
import { CategoryCombobox } from "@/components/CategoryCombobox";

const empty: GenerateInput = {
  productName: "",
  category: "",
  features: "",
  audience: "",
  tone: "Professional",
  length: "Medium",
  language: "English",
  keywords: "",
};

export default function Generator() {
  const [params] = useSearchParams();
  const templatePreset = params.get("template");
  const nav = useNavigate();
  const setUser = useStore((s) => s.setUser);
  const user = useStore((s) => s.user);

  const [input, setInput] = useState<GenerateInput>(() => ({
    ...empty,
    tone: (templatePreset === "luxury"
      ? "Luxury"
      : templatePreset === "amazon"
        ? "SEO-friendly"
        : "Professional") as Tone,
  }));
  const [output, setOutput] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);

  const set = <K extends keyof GenerateInput>(k: K, v: GenerateInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  async function generate() {
    if (!input.productName.trim()) {
      toast.error("Add a product name first.");
      return;
    }
    setLoading(true);
    setOutput(null);

    try {
      const { data } = await api.post("/generator/generate", input, {
        timeout: 90000, // OpenAI + cold-start can take a while
      });
      setOutput(data.outputJson);
      setGeneratedId(data.id);

      // Add new item to store so ContentDetail and History work immediately
      const newItem = {
        id: data.id,
        productName: data.productName,
        category: data.category || "",
        tone: data.tone,
        language: data.language,
        createdAt: new Date(data.createdAt).getTime(),
        input: data.inputJson,
        content: data.outputJson,
        saved: data.isSaved,
      };
      useStore.getState().setItems([newItem, ...useStore.getState().items]);

      // Update user credits in store
      if (user) {
        setUser({ ...user, credits: user.credits - 1 });
      }

      toast.success("Content generated.");
    } catch (err: any) {
      if (!err?.response) {
        toast.error(
          "Cannot reach server. Make sure the backend is running on port 3001.",
        );
      } else if (err.response?.status === 401) {
        toast.error("Session expired. Please sign in again.");
      } else {
        toast.error(err.response?.data?.message || "Generation failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleSave(id: string) {
    try {
      const item = useStore.getState().items.find((i) => i.id === id);
      await api.patch(`/content/${id}`, { isSaved: !item?.saved });
      useStore.getState().toggleSave(id);
      toast.success("Updated.");
    } catch (e) {
      toast.error("Failed to update.");
    }
  }

  return (
    <div className="grid lg:grid-cols-[420px_1fr] min-h-[calc(100vh-3.5rem)]">
      {/* Form */}
      <aside className="border-r border-border bg-surface p-6 lg:p-8 flex flex-col gap-5 overflow-y-auto">
        <div>
          <div className="label-eyebrow mb-1">Brief</div>
          <h2 className="text-lg font-semibold tracking-tight">
            Product details
          </h2>
        </div>

        <Field label="Product name" required>
          <Input
            value={input.productName}
            onChange={(e) => set("productName", e.target.value)}
            placeholder="Koto Lounge Chair"
          />
        </Field>

        <Field label="Category" hint="Pick or type custom">
          <CategoryCombobox
            value={input.category}
            onChange={(v) => set("category", v)}
            placeholder="Select or type a category"
          />
        </Field>

        <Field label="Key features" hint="Comma or line separated">
          <Textarea
            rows={3}
            value={input.features}
            onChange={(e) => set("features", e.target.value)}
            placeholder="Solid ash frame, boucle fabric, stain-resistant"
          />
        </Field>

        <Field label="Target audience">
          <Input
            value={input.audience}
            onChange={(e) => set("audience", e.target.value)}
            placeholder="Design-conscious homeowners"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tone">
            <Select
              value={input.tone}
              onValueChange={(v) => set("tone", v as Tone)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Length">
            <Select
              value={input.length}
              onValueChange={(v) => set("length", v as Length)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LENGTHS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Language">
          <Select
            value={input.language}
            onValueChange={(v) => set("language", v as Language)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Keywords" hint="For SEO meta">
          <Input
            value={input.keywords}
            onChange={(e) => set("keywords", e.target.value)}
            placeholder="lounge chair, scandinavian"
          />
        </Field>

        <Button
          onClick={generate}
          disabled={loading}
          size="lg"
          className="rounded-full mt-2"
        >
          {loading ? (
            <>
              <RefreshCw className="size-4 animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> Generate content
            </>
          )}
        </Button>
      </aside>

      {/* Output */}
      <section className="bg-paper/40 p-6 lg:p-10 overflow-y-auto">
        {!output && !loading && (
          <div className="h-full flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <div className="inline-flex size-12 rounded-full bg-secondary items-center justify-center mb-4">
                <Sparkles className="size-5 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight">
                Your output will appear here
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Fill in the brief on the left and hit generate. We'll produce
                six tailored content pieces for your product.
              </p>
            </div>
          </div>
        )}

        {loading && <SkeletonOutput />}

        {output && (
          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            <div className="flex justify-between items-end">
              <div>
                <div className="label-eyebrow mb-1">Generated for</div>
                <h2 className="text-xl font-semibold tracking-tight">
                  {input.productName}
                </h2>
              </div>
              {generatedId && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  <a href={`/app/content/${generatedId}`}>
                    <Pencil className="size-3.5" /> Open editor
                  </a>
                </Button>
              )}
            </div>

            <OutputBlock
              title="Product description"
              body={output.description}
            />
            <OutputBlock
              title="Key highlights"
              body={output.highlights.map((h) => "· " + h).join("\n")}
            />
            <OutputBlock
              title="SEO meta title"
              body={output.metaTitle}
              compact
            />
            <OutputBlock
              title="SEO meta description"
              body={output.metaDescription}
              compact
            />
            <OutputBlock title="Short ad copy" body={output.adCopy} compact />
            <OutputBlock
              title="Social media caption"
              body={output.socialCaption}
            />

            <div className="flex gap-2 sticky bottom-0 bg-paper/40 backdrop-blur pt-3">
              <Button
                onClick={generate}
                variant="outline"
                className="rounded-full"
              >
                <RefreshCw className="size-4" /> Regenerate all
              </Button>
              {generatedId && (
                <Button
                  onClick={async () => {
                    try {
                      await api.patch(`/content/${generatedId}`, {
                        isSaved: true,
                      });
                      useStore.getState().updateItem(generatedId, {
                        saved: true,
                      });
                      toast.success("Saved to library.");
                    } catch {
                      toast.error("Failed to save.");
                    }
                  }}
                  className="rounded-full"
                >
                  <Save className="size-4" /> Save to library
                </Button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs">
          {label}
          {required && <span className="text-highlight ml-0.5">*</span>}
        </Label>
        {hint && (
          <span className="text-[10px] text-muted-foreground font-mono">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function OutputBlock({
  title,
  body,
  compact,
}: {
  title: string;
  body: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }
  return (
    <div className="surface-card p-5 group">
      <div className="flex justify-between items-center mb-3">
        <div className="label-eyebrow">{title}</div>
        <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <Button onClick={copy} size="icon" variant="ghost" className="size-7">
            {copied ? (
              <Check className="size-3.5 text-highlight" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        </div>
      </div>
      <div
        className={`whitespace-pre-wrap text-pretty ${compact ? "text-sm font-mono text-muted-foreground" : "text-base leading-relaxed"}`}
      >
        {body}
      </div>
    </div>
  );
}

function SkeletonOutput() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="surface-card p-5">
          <div className="h-3 w-24 bg-secondary rounded mb-4" />
          <div className="h-3 w-full bg-secondary rounded mb-2" />
          <div className="h-3 w-5/6 bg-secondary rounded mb-2" />
          <div className="h-3 w-4/6 bg-secondary rounded" />
        </div>
      ))}
    </div>
  );
}
