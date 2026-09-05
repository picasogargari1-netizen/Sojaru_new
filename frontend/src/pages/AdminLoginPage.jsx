import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiErr } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function AdminLoginPage() {
  usePageMeta({ title: "Admin — Sojaru" });
  const { user, ready, login, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (ready && user?.is_admin) navigate("/admin"); }, [ready, user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(form);
      if (!u.is_admin) { logout(); toast.error("This account is not an admin."); return; }
      toast.success("Welcome back, admin!");
      navigate("/admin");
    } catch (err) {
      toast.error(apiErr(err, "Invalid credentials"));
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20">
      <div className="border-4 border-ink bg-cream p-8 shadow-[8px_8px_0_0_#111]">
        <div className="text-center">
          <ShieldCheck className="mx-auto h-9 w-9 text-ink" />
          <h1 className="mt-4 font-display text-4xl font-extrabold uppercase text-ink">Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage your Sojaru storefront.</p>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 rounded-none border-2 border-ink bg-cream" data-testid="admin-email" /></div>
          <div><Label>Password</Label><Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5 rounded-none border-2 border-ink bg-cream" data-testid="admin-password" /></div>
          <Button type="submit" disabled={loading} className="h-12 w-full rounded-none bg-ink text-base font-bold uppercase text-cream hover:bg-yellow hover:text-ink" data-testid="admin-login-submit">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
