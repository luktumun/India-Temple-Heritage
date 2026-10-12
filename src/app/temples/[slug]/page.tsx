import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowLeft, Clock3, MapPin, Sparkles, Ticket } from "lucide-react";
import { MetricTracker } from "@/components/MetricTracker";
import { SaveButton, SatisfactionRating, ShareButton } from "@/components/SaveShare";
import { findTemple } from "@/lib/temples";

type TemplePageProps = { params: Promise<{ slug: string }> };

export default function TemplePage({ params }: TemplePageProps) {
  return <Suspense fallback={<TempleLoading />}>
    <TempleDetails params={params} />
  </Suspense>;
}

async function TempleDetails({ params }: TemplePageProps) {
  await connection();
  const temple = await findTemple((await params).slug);
  if (!temple) notFound();

  return (
    <>
      <MetricTracker templeSlug={temple.slug} />
      <header className="page-shell flex h-[76px] items-center justify-between border-b border-[#e8e3d9]">
        <Link href="/" className="serif text-[18px] font-bold text-[#304438]">sacred india</Link>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#6f796d] hover:text-[#304438]"><ArrowLeft size={15} /> All temples</Link>
      </header>
      <main className="page-shell pb-20 pt-9">
        <nav className="mb-6 flex items-center gap-2 text-[10px] text-[#929187]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#536d59]">Discover</Link><span>/</span><span>{temple.state}</span><span>/</span><span className="text-[#64675d]">{temple.name}</span>
        </nav>
        <div
          className="temple-image relative flex min-h-[300px] items-end overflow-hidden rounded-[28px] md:min-h-[410px]"
          style={{ backgroundImage: temple.imageUrl ? `linear-gradient(0deg, rgba(19,30,23,.84), rgba(19,30,23,.02) 75%), url("${temple.imageUrl}")` : "linear-gradient(135deg, #756851, #b9a68d)", backgroundPosition: "center 48%" }}
          role="img"
          aria-label={temple.name}
        >
          <div className="relative z-10 w-full p-7 text-white md:p-11">
            <span className="eyebrow text-[#edcba8]">{temple.city} · {temple.state}</span>
            <h1 className="serif mt-3 max-w-3xl text-[38px] leading-[1.08] md:text-[56px]">{temple.name}</h1>
            <p className="mt-3 flex items-center gap-2 text-[12px] text-white/75"><MapPin size={14} />{temple.address || `${temple.city}, ${temple.state}`}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e9e4da] pb-6">
              <div className="flex flex-wrap gap-2">{temple.deity.map((name) => <span key={name} className="rounded-full bg-[#ecefe7] px-3 py-1.5 text-[10px] font-semibold text-[#596b58]">{name}</span>)}</div>
              <div className="flex gap-2"><SaveButton slug={temple.slug} /><ShareButton title={temple.name} /></div>
            </div>
            <section className="detail-section">
              <div className="eyebrow">The story</div><h2 className="serif mt-2 text-[25px] text-[#2f4034]">A little about this place</h2>
              <p className="mt-4 whitespace-pre-line text-[14px] leading-[1.9] text-[#707268]">{temple.history || "Historical details for this temple are being gathered."}</p>
            </section>
            {temple.rituals.length > 0 && <section className="detail-section">
              <div className="eyebrow">Daily traditions</div><h2 className="serif mt-2 text-[25px] text-[#2f4034]">Rituals & worship</h2>
              <ul className="mt-4 space-y-3">{temple.rituals.map((ritual) => <li key={ritual} className="flex items-start gap-3 text-[13px] leading-6 text-[#73746a]"><Sparkles className="mt-1 shrink-0 text-[#ba784c]" size={14} />{ritual}</li>)}</ul>
            </section>}
            {temple.festivals.length > 0 && <section className="detail-section">
              <div className="eyebrow">A calendar of devotion</div><h2 className="serif mt-2 text-[25px] text-[#2f4034]">Festivals</h2>
              <div className="mt-4 flex flex-wrap gap-2">{temple.festivals.map((festival) => <span key={festival} className="rounded-full border border-[#e6e1d7] bg-[#fffdfa] px-3.5 py-2 text-[11px] font-medium text-[#666b60]">{festival}</span>)}</div>
            </section>}
            <SatisfactionRating slug={temple.slug} />
          </article>
          <aside className="h-fit rounded-[22px] border border-[#e9e4da] bg-[#fffdfa] p-6">
            <div className="eyebrow">Plan your visit</div><h2 className="serif mt-2 text-[25px] text-[#2f4034]">A few helpful details</h2>
            <div className="mt-5 space-y-5">
              <InfoRow icon={<Clock3 size={16} />} label="Darshan timings" value={temple.darshanTimings || "Please check locally before visiting."} />
              <InfoRow icon={<MapPin size={16} />} label="Best time to visit" value={temple.bestTimeToVisit || "Ask locally about seasonal conditions."} />
              <InfoRow icon={<Ticket size={16} />} label="Entry" value={temple.entryFee || "Please confirm locally."} />
              {temple.contact && <InfoRow icon={<span className="text-[13px]">☎</span>} label="Temple contact" value={temple.contact} />}
            </div>
            {temple.guidelines.length > 0 && <div className="mt-6 border-t border-[#efebe3] pt-5">
              <div className="eyebrow">Visitor guidelines</div>
              <ul className="mt-3 space-y-2.5">{temple.guidelines.map((guideline) => <li key={guideline} className="flex gap-2 text-[11px] leading-5 text-[#73746a]"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#bd8055]" />{guideline}</li>)}</ul>
            </div>}
            <p className="mt-6 rounded-xl bg-[#f4f1e9] p-3.5 text-[10px] leading-5 text-[#818176]">Timings, access, and local practices may change. Please verify with the temple before travelling.</p>
          </aside>
        </div>
      </main>
      <footer className="border-t border-[#e8e3d9]"><div className="page-shell flex justify-between py-6 text-[10px] text-[#89887d]"><span>© Sacred India</span><Link href="/" className="hover:text-[#304438]">Explore more temples</Link></div></footer>
    </>
  );
}

function TempleLoading() {
  return <main className="page-shell py-20">
    <div className="h-72 animate-pulse rounded-[28px] bg-[#e8e3d9]" />
    <p className="mt-6 text-sm text-[#7b7b71]">Opening this temple guide…</p>
  </main>;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-start gap-3">
    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eff0e9] text-[#677764]">{icon}</span>
    <div><div className="text-[10px] font-bold uppercase tracking-[.08em] text-[#969488]">{label}</div><div className="mt-1.5 whitespace-pre-line text-[12px] leading-5 text-[#575f54]">{value}</div></div>
  </div>;
}
