"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, BookOpen, Check, Clock3, Eye, FilePlus2, LoaderCircle, LogOut, MapPin, Pencil, Plus, Save, Search, Star, Trash2, Users, X } from "lucide-react";
import type { TempleData } from "@/lib/temples";

type Stats = {
  templeCount: number;
  monthlyActiveUsers: number;
  searchSuccessRate: number | null;
  averageEngagementSeconds: number | null;
  satisfactionScore: number | null;
};
type EditorFields = {
  name: string; state: string; city: string; address: string; deity: string;
  history: string; darshanTimings: string; rituals: string; festivals: string;
  guidelines: string; imageUrl: string; bestTimeToVisit: string; entryFee: string;
  contact: string; featured: boolean;
};

const emptyForm: EditorFields = {
  name: "", state: "", city: "", address: "", deity: "", history: "",
  darshanTimings: "", rituals: "", festivals: "", guidelines: "",
  imageUrl: "", bestTimeToVisit: "", entryFee: "Free", contact: "", featured: false,
};
const toForm = (temple: TempleData): EditorFields => ({
  name: temple.name, state: temple.state, city: temple.city, address: temple.address,
  deity: temple.deity.join("\n"), history: temple.history, darshanTimings: temple.darshanTimings,
  rituals: temple.rituals.join("\n"), festivals: temple.festivals.join("\n"),
  guidelines: temple.guidelines.join("\n"), imageUrl: temple.imageUrl,
  bestTimeToVisit: temple.bestTimeToVisit, entryFee: temple.entryFee,
  contact: temple.contact, featured: temple.featured,
});
const parseList = (value: string) => value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);

async function apiRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "The request could not be completed.");
  return data;
}

export function AdminDashboard() {
  const [configured, setConfigured] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [temples, setTemples] = useState<TempleData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [editingSlug, setEditingSlug] = useState("");
  const [form, setForm] = useState<EditorFields>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    const [templeData, metrics] = await Promise.all([apiRequest("/api/admin/temples"), apiRequest("/api/admin/metrics")]);
    setTemples(templeData.temples as TempleData[]);
    setStats(metrics as Stats);
  }, []);

  useEffect(() => {
    apiRequest("/api/admin/session")
      .then(async (session) => {
        setConfigured(session.configured);
        setAuthenticated(session.authenticated);
        if (session.authenticated) await loadData();
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to check admin session."))
      .finally(() => setLoading(false));
  }, [loadData]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiRequest("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      setAuthenticated(true);
      setPassword("");
      await loadData();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await apiRequest("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setTemples([]);
    setStats(null);
    setEditingSlug("");
    setForm(emptyForm);
  }

  async function saveTemple(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const payload = {
      ...form,
      deity: parseList(form.deity),
      rituals: parseList(form.rituals),
      festivals: parseList(form.festivals),
      guidelines: parseList(form.guidelines),
    };
    try {
      await apiRequest(editingSlug ? `/api/temples/${encodeURIComponent(editingSlug)}` : "/api/temples", {
        method: editingSlug ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setNotice(editingSlug ? "Temple guide updated." : "Temple guide added.");
      setEditingSlug("");
      setForm(emptyForm);
      await loadData();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save the temple guide.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTemple(temple: TempleData) {
    if (!window.confirm(`Remove ${temple.name} from the guide? This cannot be undone.`)) return;
    setError("");
    try {
      await apiRequest(`/api/temples/${encodeURIComponent(temple.slug)}`, { method: "DELETE" });
      if (editingSlug === temple.slug) { setEditingSlug(""); setForm(emptyForm); }
      setNotice(`${temple.name} was removed.`);
      await loadData();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to remove the temple.");
    }
  }

  if (loading && !authenticated) {
    return <main className="flex min-h-screen items-center justify-center text-[#6d776c]"><LoaderCircle className="animate-spin" size={22} /><span className="ml-3 text-sm">Opening the temple desk…</span></main>;
  }

  if (!authenticated) {
    return <main className="page-shell flex min-h-screen flex-col items-center justify-center py-12">
      <Link href="/" className="absolute left-7 top-7 inline-flex items-center gap-2 text-xs font-semibold text-[#6b776c] hover:text-[#304438]"><ArrowLeft size={15} /> Public guide</Link>
      <div className="w-full max-w-[430px] rounded-[26px] border border-[#e9e4da] bg-[#fffdfa] p-8 soft-shadow sm:p-10">
        <span className="flex size-12 items-center justify-center rounded-full bg-[#30473a] text-[#f2d7b6]"><BookOpen size={21} /></span>
        <div className="eyebrow mt-6">Temple desk</div><h1 className="serif mt-2 text-[35px] text-[#29392f]">Welcome, steward.</h1>
        <p className="mt-2 text-[13px] leading-6 text-[#7c7d72]">Sign in with the private admin password to manage temple guides and view portal insights.</p>
        {!configured && <div className="mt-5 rounded-xl border border-[#efd7c0] bg-[#fff8ee] p-4 text-xs leading-5 text-[#8b6243]">Set an <code className="font-bold">ADMIN_PASSWORD</code> of at least 16 characters in <code>.env.local</code>, then restart the app.</div>}
        {error && <div role="alert" className="mt-5 rounded-xl bg-[#f9e9e6] p-3.5 text-xs text-[#9a473a]">{error}</div>}
        <form onSubmit={login} className="mt-6">
          <label className="field-label" htmlFor="admin-password">Admin password</label>
          <input id="admin-password" className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" disabled={!configured} />
          <button disabled={!configured || loading} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#30473a] py-3.5 text-sm font-semibold text-white transition hover:bg-[#23392f] disabled:cursor-not-allowed disabled:opacity-50">{loading ? <LoaderCircle size={16} className="animate-spin" /> : "Open temple desk"}</button>
        </form>
        <p className="mt-5 text-center text-[10px] text-[#99988d]">Public visitors can browse without an account.</p>
      </div>
    </main>;
  }

  const statCards = [
    { label: "Temple guides", value: stats?.templeCount ?? 0, foot: "Published in the portal", icon: BookOpen },
    { label: "Monthly visitors", value: stats?.monthlyActiveUsers ?? 0, foot: "Unique browsers this month", icon: Users },
    { label: "Search success", value: stats?.searchSuccessRate == null ? "—" : `${stats.searchSuccessRate}%`, foot: "Searches with a match", icon: Search },
    { label: "Avg. engagement", value: stats?.averageEngagementSeconds == null ? "—" : `${Math.floor(stats.averageEngagementSeconds / 60)}m ${stats.averageEngagementSeconds % 60}s`, foot: "Time spent per visit", icon: Clock3 },
    { label: "Visitor satisfaction", value: stats?.satisfactionScore == null ? "—" : `${stats.satisfactionScore} / 5`, foot: "Average guide rating", icon: Star },
  ];

  return <main className="min-h-screen pb-16">
    <header className="border-b border-[#e8e3d9] bg-[#fffdfa]"><div className="page-shell flex h-[76px] items-center justify-between">
      <Link href="/" className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-[#30473a] text-[#f2d7b6]"><span className="serif text-lg">ॐ</span></span><span className="serif text-lg font-bold text-[#29392f]">sacred india <small className="ml-1 font-sans text-[9px] font-medium uppercase tracking-[.13em] text-[#929186]">Temple desk</small></span></Link>
      <div className="flex items-center gap-3"><Link href="/" className="hidden items-center gap-1.5 text-[11px] font-semibold text-[#6e776c] hover:text-[#304438] sm:flex"><Eye size={14} /> View public guide</Link><button onClick={() => void logout()} className="inline-flex items-center gap-1.5 rounded-full border border-[#e6e1d7] px-3.5 py-2 text-[10px] font-semibold text-[#6e776c] hover:bg-[#f4f1ea]"><LogOut size={13} /> Sign out</button></div>
    </div></header>
    <div className="page-shell pt-9">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="eyebrow">Your heritage collection</div><h1 className="serif mt-2 text-[35px] text-[#29392f]">The temple desk</h1><p className="mt-1.5 text-xs text-[#838378]">Keep the journey accurate, welcoming, and up to date.</p></div><span className="inline-flex items-center gap-2 self-start rounded-full bg-[#e9eee7] px-3 py-2 text-[10px] font-semibold text-[#58705a] sm:self-auto"><span className="size-1.5 rounded-full bg-[#779676]" /> Private admin space</span></div>
      {error && <div role="alert" className="mt-6 flex items-start justify-between gap-3 rounded-xl border border-[#f0d7d1] bg-[#fff4f1] p-4 text-xs text-[#944f43]"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={15} /></button></div>}
      {notice && <div role="status" className="mt-6 flex items-center gap-2 rounded-xl border border-[#d9e6d8] bg-[#f2f8f0] p-4 text-xs text-[#4d704f]"><Check size={15} />{notice}</div>}
      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map(({ label, value, foot, icon: Icon }) => <div key={label} className="rounded-2xl border border-[#e9e4da] bg-[#fffdfa] p-4"><span className="flex size-8 items-center justify-center rounded-full bg-[#eef0e9] text-[#647663]"><Icon size={15} /></span><div className="serif mt-4 text-[25px] text-[#304438]">{value}</div><div className="mt-1 text-[10px] font-bold text-[#5e665a]">{label}</div><div className="mt-1 text-[9px] text-[#9a998e]">{foot}</div></div>)}
      </section>
      <p className="mt-3 text-right text-[9px] text-[#99988d]">Engagement is tracked in 15-second intervals. Metrics are anonymous and browser-based.</p>
      <section className="mt-9 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_370px]">
        <div className="rounded-[22px] border border-[#e9e4da] bg-[#fffdfa]">
          <div className="flex items-center justify-between border-b border-[#efebe3] px-5 py-4"><div><h2 className="serif text-[21px] text-[#304438]">Published guides</h2><p className="mt-1 text-[10px] text-[#929186]">Manage temple profiles in your collection.</p></div><span className="rounded-full bg-[#f0eee7] px-3 py-1.5 text-[10px] font-semibold text-[#697267]">{temples.length} total</span></div>
          <div className="divide-y divide-[#f0ede6]">
            {temples.map((temple) => <div key={temple.slug} className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0"><h3 className="truncate text-[12px] font-semibold text-[#39473d]">{temple.name}</h3><p className="mt-1 flex items-center gap-1 text-[10px] text-[#929186]"><MapPin size={11} />{temple.city}, {temple.state}{temple.featured ? " · Featured" : ""}</p></div>
              <div className="flex shrink-0 items-center gap-1"><Link href={`/temples/${temple.slug}`} target="_blank" aria-label={`View ${temple.name}`} className="rounded-lg p-2 text-[#7a8478] hover:bg-[#f1efe8]"><Eye size={15} /></Link><button onClick={() => { setEditingSlug(temple.slug); setForm(toForm(temple)); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label={`Edit ${temple.name}`} className="rounded-lg p-2 text-[#7a8478] hover:bg-[#f1efe8]"><Pencil size={14} /></button><button onClick={() => void deleteTemple(temple)} aria-label={`Delete ${temple.name}`} className="rounded-lg p-2 text-[#ac7768] hover:bg-[#faefec]"><Trash2 size={14} /></button></div>
            </div>)}
            {temples.length === 0 && <div className="px-5 py-10 text-center text-xs text-[#8c8b80]">No temple guides have been added yet.</div>}
          </div>
        </div>
        <form onSubmit={saveTemple} className="rounded-[22px] border border-[#e9e4da] bg-[#fffdfa] p-5">
          <div className="flex items-center justify-between"><div><span className="eyebrow">{editingSlug ? "Update a listing" : "Grow the collection"}</span><h2 className="serif mt-1 text-[23px] text-[#304438]">{editingSlug ? "Edit temple guide" : "Add a temple"}</h2></div>{editingSlug ? <button type="button" onClick={() => { setEditingSlug(""); setForm(emptyForm); }} aria-label="Cancel editing" className="rounded-full p-2 text-[#818177] hover:bg-[#f2f0ea]"><X size={16} /></button> : <FilePlus2 className="text-[#6b806a]" size={20} />}</div>
          <div className="mt-5 grid gap-3">
            <Field label="Temple name *" value={form.name} required onChange={(name) => setForm({ ...form, name })} />
            <div className="grid grid-cols-2 gap-3"><Field label="State *" value={form.state} required onChange={(state) => setForm({ ...form, state })} /><Field label="City *" value={form.city} required onChange={(city) => setForm({ ...form, city })} /></div>
            <Field label="Address" value={form.address} onChange={(address) => setForm({ ...form, address })} />
            <Field label="Deity / deities (one per line)" value={form.deity} multiline onChange={(deity) => setForm({ ...form, deity })} />
            <Field label="Historical background" value={form.history} multiline onChange={(history) => setForm({ ...form, history })} />
            <Field label="Darshan timings" value={form.darshanTimings} multiline onChange={(darshanTimings) => setForm({ ...form, darshanTimings })} />
            <Field label="Rituals (one per line)" value={form.rituals} multiline onChange={(rituals) => setForm({ ...form, rituals })} />
            <Field label="Festivals (one per line)" value={form.festivals} multiline onChange={(festivals) => setForm({ ...form, festivals })} />
            <Field label="Visitor guidelines (one per line)" value={form.guidelines} multiline onChange={(guidelines) => setForm({ ...form, guidelines })} />
            <Field label="Image URL (https)" value={form.imageUrl} onChange={(imageUrl) => setForm({ ...form, imageUrl })} />
            <Field label="Best time to visit" value={form.bestTimeToVisit} onChange={(bestTimeToVisit) => setForm({ ...form, bestTimeToVisit })} />
            <div className="grid grid-cols-2 gap-3"><Field label="Entry fee" value={form.entryFee} onChange={(entryFee) => setForm({ ...form, entryFee })} /><Field label="Contact" value={form.contact} onChange={(contact) => setForm({ ...form, contact })} /></div>
            <label className="flex cursor-pointer items-center gap-2.5 text-xs text-[#657064]"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} className="size-4 accent-[#395640]" />Feature this place on the home page</label>
          </div>
          <button type="submit" disabled={saving} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#30473a] py-3.5 text-xs font-semibold text-white transition hover:bg-[#23392f] disabled:opacity-60">{saving ? <LoaderCircle size={15} className="animate-spin" /> : editingSlug ? <Save size={15} /> : <Plus size={16} />}{editingSlug ? "Save changes" : "Publish temple guide"}</button>
          <p className="mt-3 text-center text-[9px] text-[#99988d]">Temple details are stored in the connected MongoDB database.</p>
        </form>
      </section>
    </div>
  </main>;
}

function Field({ label, value, required, multiline, onChange }: { label: string; value: string; required?: boolean; multiline?: boolean; onChange: (value: string) => void }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <label htmlFor={id} className="block">
    <span className="field-label">{label}</span>
    {multiline
      ? <textarea id={id} value={value} required={required} onChange={(event) => onChange(event.target.value)} className="field min-h-[84px] resize-y text-xs leading-5" />
      : <input id={id} value={value} required={required} onChange={(event) => onChange(event.target.value)} className="field text-xs" />}
  </label>;
}
