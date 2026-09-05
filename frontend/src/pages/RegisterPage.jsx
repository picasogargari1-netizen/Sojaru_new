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

export default function RegisterPage() {
  usePageMeta({ title: "Create account — Sojaru" });
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Welcome to the pack!");
      navigate("/account");
    } catch (err) {
      toast.error(apiErr(err, "Could not create your account"));
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:py-24">
      <div className="text-center">
        <PawPrint className="mx-auto h-8 w-8 text-terracotta" />
        <h1 className="mt-4 font-display text-4xl font-semibold text-ink">Join Sojaru</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create an account for you and your best friend.</p>
      </div>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>First name</Label><Input required value={form.first_name} onChange={set("first_name")} className="mt-1.5 rounded-xl bg-cream" data-testid="register-firstname" /></div>
          <div><Label>Last name</Label><Input value={form.last_name} onChange={set("last_name")} className="mt-1.5 rounded-xl bg-cream" data-testid="register-lastname" /></div>
        </div>
        <div><Label>Email</Label><Input type="email" required value={form.email} onChange={set("email")} className="mt-1.5 rounded-xl bg-cream" data-testid="register-email" /></div>
        <div><Label>Password</Label><Input type="password" required minLength={6} value={form.password} onChange={set("password")} className="mt-1.5 rounded-xl bg-cream" data-testid="register-password" /><p className="mt-1 text-xs text-muted-foreground">At least 6 characters.</p></div>
        <Button type="submit" disabled={loading} className="h-12 w-full rounded-full bg-ink text-base font-semibold text-cream hover:bg-terracotta" data-testid="register-submit">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="font-semibold text-terracotta hover:underline" data-testid="go-login">Log in</Link>
      </p>
    </div>
  );
}
