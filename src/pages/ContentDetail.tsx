import { useParams, NavLink } from "react-router-dom";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { ArrowLeft, Copy, Save, Download, BookmarkCheck, Bookmark } from "lucide-react";
import { toast } from "sonner";

export default function ContentDetail() {
  const { id = "" } = useParams();
  const item = useStore((s) => s.items.find((i) => i.id === id));
  const update = useStore((s) => s.updateItem);
  const toggle = useStore((s) => s.toggleSave);

  const [draft, setDraft] = useState(item?.content);
  const [hi, setHi] = useState(item?.content.highlights.join("\n") ?? "");

  useEffect(() => {
    if (item) {
      setDraft(item.content);
      setHi(item.content.highlights.join("\n"));
    }
  }, [item]);

  if (!item || !draft) {
    return (
      <div className="p-10 text-center">
        <p className="text-muted-foreground mb-4">Content not found.</p>
        <Button asChild variant="outline"><NavLink to="/app/saved">Back to library</NavLink></Button>
      </div>
    );
  }

  function save() {
    if (!draft) return;
    update(id, { content: { ...draft, highlights: hi.split("\n").map((s) => s.trim()).filter(Boolean) } });
    toast.success("Changes saved.");
  }

  function copyAll() {
    const text = [
      `# ${item!.productName}`, "",
      "## Description", draft!.description, "",
      "## Highlights", hi, "",
      "## Meta title", draft!.metaTitle,
      "## Meta description", draft!.metaDescription, "",
      "## Ad copy", draft!.adCopy, "",
      "## Social caption", draft!.socialCaption,
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("All content copied.");
  }

  function exportFile(ext: "txt" | "doc") {
    const text = [
      `${item!.productName}\n${"=".repeat(item!.productName.length)}`, "",
      "DESCRIPTION", draft!.description, "",
      "HIGHLIGHTS", hi, "",
      "META TITLE: " + draft!.metaTitle,
      "META DESCRIPTION: " + draft!.metaDescription, "",
      "AD COPY", draft!.adCopy, "",
      "SOCIAL CAPTION", draft!.socialCaption,
    ].join("\n");
    const blob = new Blob([text], { type: ext === "txt" ? "text/plain" : "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${item!.productName.replace(/\s+/g, "-")}.${ext}`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button asChild variant="ghost" size="sm"><NavLink to="/app/saved"><ArrowLeft className="size-4" /> Library</NavLink></Button>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => toggle(id)} variant="outline" size="sm" className="rounded-full">
            {item.saved ? <><BookmarkCheck className="size-3.5 text-highlight" /> Saved</> : <><Bookmark className="size-3.5" /> Save</>}
          </Button>
          <Button onClick={copyAll} variant="outline" size="sm" className="rounded-full"><Copy className="size-3.5" /> Copy all</Button>
          <Button onClick={() => exportFile("txt")} variant="outline" size="sm" className="rounded-full"><Download className="size-3.5" /> .txt</Button>
          <Button onClick={() => exportFile("doc")} variant="outline" size="sm" className="rounded-full"><Download className="size-3.5" /> .doc</Button>
          <Button onClick={save} size="sm" className="rounded-full"><Save className="size-3.5" /> Save changes</Button>
        </div>
      </div>

      <div className="surface-card p-6">
        <div className="label-eyebrow mb-1">Product</div>
        <h1 className="text-2xl font-semibold tracking-tight">{item.productName}</h1>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground font-mono">
          <span>{item.category || "—"}</span>
          <span>·</span>
          <span>{item.tone}</span>
          <span>·</span>
          <span>{item.language}</span>
          <span>·</span>
          <span>{new Date(item.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <Section label="Product description">
        <Textarea rows={8} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
      </Section>

      <Section label="Key highlights" hint="One per line">
        <Textarea rows={5} value={hi} onChange={(e) => setHi(e.target.value)} />
      </Section>

      <div className="grid md:grid-cols-2 gap-4">
        <Section label="SEO meta title">
          <Input value={draft.metaTitle} onChange={(e) => setDraft({ ...draft, metaTitle: e.target.value })} />
          <div className="text-[10px] font-mono text-muted-foreground mt-1">{draft.metaTitle.length} / 60</div>
        </Section>
        <Section label="SEO meta description">
          <Textarea rows={3} value={draft.metaDescription} onChange={(e) => setDraft({ ...draft, metaDescription: e.target.value })} />
          <div className="text-[10px] font-mono text-muted-foreground mt-1">{draft.metaDescription.length} / 160</div>
        </Section>
      </div>

      <Section label="Ad copy">
        <Textarea rows={3} value={draft.adCopy} onChange={(e) => setDraft({ ...draft, adCopy: e.target.value })} />
      </Section>
      <Section label="Social media caption">
        <Textarea rows={4} value={draft.socialCaption} onChange={(e) => setDraft({ ...draft, socialCaption: e.target.value })} />
      </Section>
    </div>
  );
}

function Section({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-5">
      <div className="flex justify-between items-baseline mb-3">
        <Label className="label-eyebrow">{label}</Label>
        {hint && <span className="text-[10px] text-muted-foreground font-mono">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
