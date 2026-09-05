import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Upload, Trash2, Plus, X, LogOut, Image as ImageIcon, Type, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { admin, mediaUrl, apiErr } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePageMeta } from "@/hooks/usePageMeta";

function HeroManager() {
  const { settings, reloadSettings } = useStore();
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const images = settings?.hero_images || [];

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await admin.uploadHero(fd);
      await reloadSettings();
      toast.success("Banner image added");
    } catch (err) { toast.error(apiErr(err, "Upload failed")); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const onDelete = async (id) => {
    setBusy(true);
    try { await admin.deleteHero(id); await reloadSettings(); toast.success("Image removed"); }
    catch (err) { toast.error(apiErr(err)); } finally { setBusy(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Up to 5 images. They auto-slide on the homepage hero.</p>
        <span className="font-mono text-sm font-bold">{images.length}/5</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((img) => (
          <div key={img.id} data-testid={`hero-thumb-${img.id}`} className="group relative overflow-hidden border-2 border-ink">
            <img src={mediaUrl(img.url)} alt={img.alt} className="aspect-[4/3] w-full object-cover" />
            <button onClick={() => onDelete(img.id)} disabled={busy} data-testid={`hero-delete-${img.id}`} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-ink text-cream transition-colors hover:bg-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {images.length < 5 && (
          <button onClick={() => fileRef.current?.click()} disabled={busy} data-testid="hero-upload-btn" className="flex aspect-[4/3] flex-col items-center justify-center gap-2 border-2 border-dashed border-ink bg-softyellow text-ink transition-colors hover:bg-yellow">
            {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            <span className="text-sm font-bold uppercase">Upload</span>
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} className="hidden" data-testid="hero-file-input" />
    </div>
  );
}

function MarqueeManager() {
  const { settings, reloadSettings } = useStore();
  const [texts, setTexts] = useState([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setTexts(settings?.marquee_texts || []); }, [settings]);

  const update = (i, v) => setTexts((t) => t.map((x, idx) => (idx === i ? v : x)));
  const remove = (i) => setTexts((t) => t.filter((_, idx) => idx !== i));
  const add = () => setTexts((t) => [...t, ""]);
  const save = async () => {
    setSaving(true);
    try { await admin.updateSettings({ marquee_texts: texts.filter((t) => t.trim()) }); await reloadSettings(); toast.success("Moving text updated"); }
    catch (err) { toast.error(apiErr(err)); } finally { setSaving(false); }
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground">These lines scroll in the bar above the header.</p>
      <div className="mt-5 space-y-3">
        {texts.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input value={t} onChange={(e) => update(i, e.target.value)} className="rounded-none border-2 border-ink bg-cream" data-testid={`marquee-input-${i}`} />
            <button onClick={() => remove(i)} data-testid={`marquee-remove-${i}`} className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-ink hover:bg-destructive hover:text-white"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <Button onClick={add} variant="outline" className="rounded-none border-2 border-ink" data-testid="marquee-add"><Plus className="mr-2 h-4 w-4" /> Add line</Button>
        <Button onClick={save} disabled={saving} className="rounded-none bg-ink font-bold uppercase text-cream hover:bg-yellow hover:text-ink" data-testid="marquee-save">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
        </Button>
      </div>
    </div>
  );
}

function FestiveManager() {
  const { settings, reloadSettings, categories } = useStore();
  const [festive, setFestive] = useState({ title: "", category_id: "", enabled: true });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (settings?.festive) setFestive({
      title: settings.festive.title || "",
      category_id: settings.festive.category_id ? String(settings.festive.category_id) : "",
      enabled: settings.festive.enabled !== false,
    });
  }, [settings]);

  const save = async () => {
    setSaving(true);
    try {
      await admin.updateSettings({ festive: { title: festive.title, category_id: festive.category_id ? Number(festive.category_id) : null, enabled: festive.enabled } });
      await reloadSettings();
      toast.success("Festive collection updated");
    } catch (err) { toast.error(apiErr(err)); } finally { setSaving(false); }
  };

  return (
    <div className="max-w-lg space-y-5">
      <p className="text-sm text-muted-foreground">A single highlighted collection card shown below the hero banner. Change its title and the WooCommerce category it pulls products from, any time.</p>
      <div>
        <Label>Card title</Label>
        <Input value={festive.title} onChange={(e) => setFestive({ ...festive, title: e.target.value })} placeholder="e.g. Diwali Edit, Holiday Gifting" className="mt-1.5 rounded-none border-2 border-ink bg-cream" data-testid="festive-title-input" />
      </div>
      <div>
        <Label>Products from category</Label>
        <Select value={festive.category_id} onValueChange={(v) => setFestive({ ...festive, category_id: v })}>
          <SelectTrigger className="mt-1.5 rounded-none border-2 border-ink bg-cream" data-testid="festive-category-select"><SelectValue placeholder="Choose a category" /></SelectTrigger>
          <SelectContent>
            {categories.filter((c) => c.slug !== "uncategorized").map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <label className="flex items-center justify-between border-2 border-ink bg-cream px-4 py-3">
        <span className="text-sm font-bold text-ink">Show this collection on the homepage</span>
        <Switch checked={festive.enabled} onCheckedChange={(v) => setFestive({ ...festive, enabled: v })} data-testid="festive-enabled" />
      </label>
      <Button onClick={save} disabled={saving} className="rounded-none bg-ink font-bold uppercase text-cream hover:bg-yellow hover:text-ink" data-testid="festive-save">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save collection"}
      </Button>
    </div>
  );
}

export default function AdminDashboard() {
  usePageMeta({ title: "Admin Dashboard — Sojaru" });
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (ready && !user?.is_admin) navigate("/admin/login"); }, [ready, user, navigate]);
  if (!ready || !user?.is_admin) return <div className="flex justify-center py-32"><Loader2 className="h-6 w-6 animate-spin text-ink" /></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-ink pb-6">
        <div>
          <div className="inline-block bg-yellow px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-ink">Admin panel</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold uppercase text-ink">Storefront Manager</h1>
        </div>
        <Button onClick={() => { logout(); navigate("/"); }} variant="outline" className="rounded-none border-2 border-ink" data-testid="admin-logout"><LogOut className="mr-2 h-4 w-4" /> Log out</Button>
      </div>

      <Tabs defaultValue="hero" className="mt-8">
        <TabsList className="mb-8 flex flex-wrap gap-2 bg-transparent p-0">
          <TabsTrigger value="hero" className="rounded-none border-2 border-ink data-[state=active]:bg-yellow" data-testid="admin-tab-hero"><ImageIcon className="mr-2 h-4 w-4" /> Hero Banner</TabsTrigger>
          <TabsTrigger value="marquee" className="rounded-none border-2 border-ink data-[state=active]:bg-yellow" data-testid="admin-tab-marquee"><Type className="mr-2 h-4 w-4" /> Moving Text</TabsTrigger>
          <TabsTrigger value="festive" className="rounded-none border-2 border-ink data-[state=active]:bg-yellow" data-testid="admin-tab-festive"><Sparkles className="mr-2 h-4 w-4" /> Festive Collection</TabsTrigger>
        </TabsList>
        <TabsContent value="hero"><HeroManager /></TabsContent>
        <TabsContent value="marquee"><MarqueeManager /></TabsContent>
        <TabsContent value="festive"><FestiveManager /></TabsContent>
      </Tabs>
    </div>
  );
}
