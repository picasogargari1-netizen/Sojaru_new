import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, PawPrint } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiErr } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function LoginPage() {
  usePageMeta({ title: "Log in — Sojaru" });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success("Welcome back!");
      navigate("/account");
    } catch (err) {
      toast.error(apiErr(err, "Invalid email or password"));
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:py-24">
      <div className="text-center">
        <PawPrint className="mx-auto h-8 w-8 text-terracotta" />
        <h1 className="mt-4 font-display text-4xl font-semibold text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Log in to track orders and manage your account.</p>
      </div>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 rounded-xl bg-cream" data-testid="login-email" /></div>
        <div><Label>Password</Label><Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5 rounded-xl bg-cream" data-testid="login-password" /></div>
        <Button type="submit" disabled={loading} className="h-12 w-full rounded-full bg-ink text-base font-semibold text-cream hover:bg-terracotta" data-testid="login-submit">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Sojaru? <Link to="/register" className="font-semibold text-terracotta hover:underline" data-testid="go-register">Create an account</Link>
      </p>
    </div>
  );
}
