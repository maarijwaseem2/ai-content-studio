import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TONES, LANGUAGES } from "@/lib/mockGenerator";
import { toast } from "sonner";

export default function Settings() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tone, setTone] = useState("Professional");
  const [lang, setLang] = useState("English");

  useEffect(() => {
    if (user) {
      setName(user.email.split("@")[0]);
      setEmail(user.email);
    }
  }, [user]);

  async function handleSaveProfile() {
    try {
      // In a real app we'd have a PATCH /user/profile
      toast.success("Profile appearance updated locally.");
    } catch (e) {
      toast.error("Update failed.");
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <div className="label-eyebrow mb-1">Account</div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      </div>

      <Card title="Profile">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={email} disabled type="email" />
          </Field>
        </div>
        <Button
          onClick={handleSaveProfile}
          className="rounded-full mt-4 self-start"
        >
          Save profile
        </Button>
      </Card>

      <Card title="Password">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Current password">
            <Input type="password" />
          </Field>
          <Field label="New password">
            <Input type="password" />
          </Field>
        </div>
        <Button
          onClick={() => toast.success("Password changed.")}
          className="rounded-full mt-4 self-start"
        >
          Update password
        </Button>
      </Card>

      <Card title="Defaults">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Default tone">
            <Select value={tone} onValueChange={setTone}>
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
          <Field label="Default language">
            <Select value={lang} onValueChange={setLang}>
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
        </div>
      </Card>

      <Card title="Billing">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">
              {user?.credits || 0} credits remaining
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Status: {user ? "Authenticated" : "Guest"}
            </div>
          </div>
          <Button variant="outline" className="rounded-full">
            Manage billing
          </Button>
        </div>
      </Card>

      <Card title="Danger zone" danger>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Delete account</div>
            <div className="text-xs text-muted-foreground mt-1">
              This permanently removes all your generations.
            </div>
          </div>
          <Button
            variant="destructive"
            className="rounded-full"
            onClick={() => toast.error("Deletion is disabled in demo.")}
          >
            Delete account
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Card({
  title,
  children,
  danger,
}: {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={`surface-card p-6 flex flex-col ${danger ? "border-destructive/30" : ""}`}
    >
      <h2 className="text-base font-semibold tracking-tight mb-4">{title}</h2>
      {children}
    </div>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
