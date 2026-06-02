import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useStore } from "@/lib/store";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TONES, LANGUAGES } from "@/lib/mockGenerator";
import { toast } from "sonner";
import { AlertTriangle, Clock } from "lucide-react";

export default function Settings() {
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tone, setTone] = useState("Professional");
  const [lang, setLang] = useState("English");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<any>(null);
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (user) {
      setName(user.email.split("@")[0]);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (!user || isAdmin) return;
    api
      .get("/user/delete-request")
      .then(({ data }) => setPendingDeletion(data))
      .catch(() => {});
  }, [user, isAdmin]);

  async function handleSaveProfile() {
    try {
      toast.success("Profile appearance updated locally.");
    } catch (e) {
      toast.error("Update failed.");
    }
  }

  async function submitDeletionRequest() {
    setDeleteLoading(true);
    try {
      const { data } = await api.post("/user/delete-request", {
        reason: deleteReason,
      });
      setPendingDeletion(data);
      setDeleteOpen(false);
      setDeleteReason("");
      toast.success("Deletion request sent to admin for review.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Could not submit request",
      );
    } finally {
      setDeleteLoading(false);
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
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-medium">
              {user?.credits || 0} credits remaining
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Plan:{" "}
              {user?.subscriptionStatus === "ACTIVE"
                ? user?.subscriptionTier || "Active"
                : "Free"}
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => nav("/app/pricing")}
          >
            Manage billing
          </Button>
        </div>
      </Card>

      {!isAdmin && (
        <Card title="Danger zone" danger>
          {pendingDeletion ? (
            <div className="flex items-start gap-3 rounded-md border border-amber-400/40 bg-amber-400/10 p-3">
              <Clock className="size-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium">
                  Deletion request pending
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Submitted{" "}
                  {new Date(pendingDeletion.createdAt).toLocaleString()}. An
                  admin will review it shortly. You'll keep access until it's
                  approved.
                </div>
                {pendingDeletion.reason && (
                  <div className="text-xs mt-2 italic text-muted-foreground">
                    "{pendingDeletion.reason}"
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Delete account</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Sends a request to admin. Once approved, your account and all
                  generations are permanently removed.
                </div>
              </div>
              <Button
                variant="destructive"
                className="rounded-full"
                onClick={() => setDeleteOpen(true)}
              >
                Request deletion
              </Button>
            </div>
          )}
        </Card>
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-destructive" />
              Request account deletion
            </DialogTitle>
            <DialogDescription>
              An admin will review your request. If approved, your account and
              all generations will be permanently deleted. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reason" className="text-xs">
              Reason (optional)
            </Label>
            <Textarea
              id="reason"
              rows={3}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Help us improve — why are you leaving?"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submitDeletionRequest}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Submitting..." : "Submit request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
