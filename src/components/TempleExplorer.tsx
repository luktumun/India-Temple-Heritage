"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Bookmark, ChevronDown, Compass,
  MapPin, Search, SlidersHorizontal, Sparkles, X,
} from "lucide-react";
import type { TempleData } from "@/lib/temples";
import { MetricTracker } from "@/components/MetricTracker";
import { SaveButton } from "@/components/SaveShare";
import { getSavedTemplesSnapshot, getVisitorIdSnapshot, subscribeToSavedTemples, subscribeToVisitorId } from "@/lib/portal-storage";

const imageFallback =
  "linear-gradient(180deg, rgba(24,33,27,.04), rgba(24,33,27,.4)), linear-gradient(135deg, #c6b297, #756a58)";

function imageStyle(imageUrl: string, position = "center") {
  return {
    backgroundImage: imageUrl ? `linear-gradient(180deg, rgba(20,28,24,.02), rgba(20,28,24,.18)), url("${imageUrl}")` : imageFallback,
    backgroundPosition: position,
  };
}

export function TempleExplorer({ temples }: { temples: TempleData[] }) {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const visitorId = useSyncExternalStore(subscribeToVisitorId, getVisitorIdSnapshot, () => "");
  const savedSnapshot = useSyncExternalStore(subscribeToSavedTemples, getSavedTemplesSnapshot, () => "[]");
  const saved = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(savedSnapshot);
      return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed as string[] : [];
    } catch {
      return [];
    }
  }, [savedSnapshot]);

  const cities = useMemo(
    () => [...new Set(temples.filter((temple) => !region || temple.state === region).map((temple) => temple.city))].sort(),
    [temples, region],
  );
  const states = useMemo(() => [...new Set(temples.map((temple) => temple.state))].sort(), [temples]);
  const visibleTemples = useMemo(
    () =>
      temples.filter((temple) => {
        const query = search.trim().toLowerCase();
        const matchesText =
          !query ||
          [temple.name, temple.city, temple.state, ...temple.deity, ...temple.festivals]
            .some((value) => value.toLowerCase().includes(query));
        return (
          matchesText &&
          (!region || temple.state === region) &&
          (!city || temple.city === city) &&
          (!savedOnly || saved.includes(temple.slug))
        );
      }),
    [temples, search, region, city, savedOnly, saved],
  );
  const featured = temples.find((temple) => temple.featured) ?? temples[0];

  useEffect(() => {
    if (!visitorId || !search.trim()) return;
    const timer = window.setTimeout(() => {
      fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "search",
          visitorId,
          query: search.trim().slice(0, 160),
          resultCount: visibleTemples.length,
        }),
      }).catch((error: unknown) => console.error("Unable to record search metric.", error));
    }, 650);
    return () => window.clearTimeout(timer);
  }, [search, visibleTemples.length, visitorId]);

  return (
    <>
      <MetricTracker />
      <header className="page-shell flex h-[82px] items-center justify-between border-b border-[#e8e3d9]">
        <Link href="/" className="flex items-center gap-3" aria-label="Sacred India home">
          <span className="flex size-10 items-center justify-center rounded-full bg-[#30473a] text-[#f2d7b6]">
            <span className="serif text-xl">ॐ</span>
          </span>
          <span>
            <span className="serif block text-[17px] font-bold leading-5 tracking-[-.025em]">sacred india</span>
            <span className="mt-1 block text-[8px] font-bold uppercase tracking-[.2em] text-[#97958a]">A living heritage guide</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-[13px] font-medium md:flex" aria-label="Main navigation">
          <a className="nav-link active" href="#discover">Discover</a>
          <a className="nav-link" href="#regions">Explore by region</a>
          <button type="button" onClick={() => { setSavedOnly((value) => !value); document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" }); }} className={`nav-link inline-flex items-center gap-1.5 ${savedOnly ? "active" : ""}`}>
            <Bookmark size={14} /> Saved places
          </button>
        </nav>
        <Link href="/admin" className="rounded-full border border-[#dedbd1] px-4 py-2 text-[11px] font-semibold text-[#536257] transition hover:bg-white">
          For temple admins <ArrowUpRight className="ml-1 inline" size={13} />
        </Link>
      </header>

      <main>
        <section className="page-shell grid items-center gap-10 pb-14 pt-14 md:grid-cols-[1.04fr_.96fr] md:pb-20 md:pt-20">
          <div className="relative z-10">
            <div className="eyebrow mb-5 flex items-center gap-2"><Sparkles size={13} /> India, in its sacred places</div>
            <h1 className="serif max-w-[590px] text-[50px] font-normal leading-[1.05] tracking-[-.045em] text-[#25372d] md:text-[68px]">
              Find your way<br />to the <em className="font-normal text-[#bb7546]">sacred.</em>
            </h1>
            <p className="mt-6 max-w-[440px] text-[15px] leading-7 text-[#75766c]">
              Stories, darshan timings and thoughtful travel notes for India’s timeless temples. Wherever your journey leads.
            </p>
            <form
              className="soft-shadow mt-8 flex max-w-[540px] items-center gap-3 rounded-2xl border border-[#eeebe4] bg-[#fffdfa] p-2.5 pl-4"
              onSubmit={(event) => { event.preventDefault(); document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" }); }}
              role="search"
            >
              <Search className="shrink-0 text-[#9a9a8e]" size={19} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Try “Meenakshi” or “Tamil Nadu”"
                aria-label="Search temples by name, deity, city or state"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-[#293a30] outline-none placeholder:text-[#a3a197]"
              />
              {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="rounded-full p-2 text-[#85857a] hover:bg-[#f2f0ea]"><X size={15} /></button>}
              <button type="submit" className="rounded-xl bg-[#2e4839] px-5 py-3 text-[12px] font-semibold text-white transition hover:bg-[#233a2e]">Explore</button>
            </form>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-[#8b8a7f]">
              <span className="font-semibold text-[#6c7167]">A little inspiration</span>
              {["Meenakshi", "Tirupati", "Rath Yatra"].map((term) => (
                <button key={term} type="button" onClick={() => setSearch(term)} className="rounded-full bg-[#efede6] px-3 py-1.5 transition hover:bg-[#e5e1d7]">{term}</button>
              ))}
            </div>
          </div>

          <div className="relative mx-auto h-[330px] w-full max-w-[480px] md:h-[390px]">
            <div className="absolute inset-x-5 bottom-0 top-3 rotate-[2.5deg] rounded-[45%_45%_25px_25px] bg-[#e5ddd0]" />
            <div
              className="temple-image absolute inset-0 overflow-hidden rounded-[48%_48%_25px_25px] shadow-[0_25px_70px_rgba(31,40,32,.2)]"
              style={imageStyle(featured?.imageUrl ?? "", "center")}
              role="img"
              aria-label={featured ? `${featured.name} temple` : "An Indian temple at sunset"}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#18241d]/80 via-transparent to-[#18241d]/5" />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-7 text-white md:p-9">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-[.2em] text-[#edd2b2]">A place to begin</span>
                  <h2 className="serif mt-2 text-[29px] leading-tight md:text-[34px]">{featured?.name ?? "The journey begins here"}</h2>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-white/75"><MapPin size={13} />{featured ? `${featured.city}, ${featured.state}` : "Across India"}</p>
                </div>
                {featured && <Link href={`/temples/${featured.slug}`} aria-label={`Explore ${featured.name}`} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/30"><ArrowDownRight size={20} /></Link>}
              </div>
            </div>
            <div className="absolute right-[-7px] top-12 flex size-[82px] rotate-6 flex-col items-center justify-center rounded-full border border-[#f7f1e7] bg-[#fffaf1] text-center shadow-[0_10px_35px_rgba(38,42,33,.09)]">
              <span className="serif text-[25px] leading-none text-[#ba7646]">ॐ</span>
              <span className="mt-1 text-[7px] font-bold uppercase tracking-[.15em] text-[#72766a]">Journey inward</span>
            </div>
            <div className="absolute bottom-12 left-[-19px] hidden items-center gap-3 rounded-2xl border border-white/80 bg-[#fffdfa]/95 px-4 py-3 shadow-lg md:flex">
              <span className="flex size-9 items-center justify-center rounded-full bg-[#edf0e7] text-[#52654d]"><Compass size={17} /></span>
              <span><b className="block text-[11px] text-[#39473a]">Travel with intention</b><small className="mt-1 block text-[9px] text-[#939187]">A little planning goes a long way</small></span>
            </div>
          </div>
        </section>

        <section id="regions" className="border-y border-[#e8e3d9] bg-[#f2efe8]">
          <div className="page-shell flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-full bg-[#e5e3d8] text-[#657365]"><MapPin size={15} /></span><span className="text-xs font-semibold text-[#515b50]">Find a pilgrimage by place</span></div>
            <div className="flex flex-wrap gap-2">
              {[{ label: "All India", state: "" }, ...states.map((state) => ({ label: state, state }))].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => { setRegion(item.state); setCity(""); }}
                  className={`filter-chip rounded-full border px-3.5 py-2 text-[10px] font-semibold ${region === item.state ? "border-[#344c3c] bg-[#344c3c] text-white" : "border-[#e1ddd3] bg-[#faf8f3] text-[#73756b] hover:border-[#a6b0a1]"}`}
                >{item.label}</button>
              ))}
            </div>
          </div>
        </section>

        <section id="discover" className="page-shell pb-20 pt-14 md:pt-[72px]">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="eyebrow mb-3">Thoughtfully gathered</div>
              <h2 className="serif text-[35px] leading-tight text-[#29392f] md:text-[42px]">
                {savedOnly ? "Your saved places" : region ? `Sacred places in ${region}` : "Places of peace & wonder"}
              </h2>
              <p className="mt-2.5 text-[13px] text-[#848378]">A little context for a more meaningful journey.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {cities.length > 0 && (
                <label className="relative">
                  <span className="sr-only">Filter by city</span>
                  <select value={city} onChange={(event) => setCity(event.target.value)} className="appearance-none rounded-full border border-[#e2ded4] bg-[#fffdfa] py-2.5 pl-4 pr-9 text-[11px] font-semibold text-[#697267] outline-none focus:border-[#99aa9a]">
                    <option value="">All cities</option>
                    {cities.map((name) => <option key={name} value={name}>{name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8d81]" size={14} />
                </label>
              )}
              <button type="button" onClick={() => setSavedOnly((value) => !value)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[11px] font-semibold ${savedOnly ? "border-[#344c3c] bg-[#344c3c] text-white" : "border-[#e2ded4] bg-[#fffdfa] text-[#697267]"}`}>
                <SlidersHorizontal size={14} />{savedOnly ? "Showing saved" : "Saved places"}
              </button>
            </div>
          </div>

          {search && <p className="mt-7 text-xs text-[#85857a]">Showing results for <b className="text-[#394a3d]">“{search}”</b></p>}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTemples.map((temple, index) => (
              <TempleCard key={temple.slug} temple={temple} index={index} />
            ))}
          </div>
          {visibleTemples.length === 0 && (
            <div className="mt-8 rounded-3xl border border-dashed border-[#dcd7cc] bg-[#f4f1ea] px-6 py-16 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#e9e6dc] text-[#68796b]"><Compass size={21} /></span>
              <h3 className="serif mt-4 text-2xl text-[#354439]">{temples.length ? "No places found just yet." : "Your journey starts here."}</h3>
              <p className="mx-auto mt-2 max-w-[390px] text-sm leading-6 text-[#818177]">
                {temples.length ? "Try another name or clear a filter to find a temple." : "Temple guides will appear here as your heritage collection grows. Admins can add the first place."}
              </p>
              {temples.length > 0 && <button type="button" onClick={() => { setSearch(""); setRegion(""); setCity(""); setSavedOnly(false); }} className="mt-5 text-xs font-semibold text-[#375442] underline underline-offset-4">Clear filters</button>}
              {!temples.length && <Link href="/admin" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#344c3c] px-4 py-2.5 text-xs font-semibold text-white">Open temple admin <ArrowRight size={14} /></Link>}
            </div>
          )}
        </section>

        <section className="page-shell pb-16">
          <div className="overflow-hidden rounded-[28px] bg-[#243b30] px-7 py-8 text-white md:flex md:items-center md:justify-between md:px-10 md:py-9">
            <div className="flex items-start gap-4">
              <span className="hidden size-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[#e8c39f] sm:flex"><Sparkles size={19} /></span>
              <div><div className="text-[9px] font-bold uppercase tracking-[.18em] text-[#d3b392]">Before you set out</div><h2 className="serif mt-2 text-[25px] md:text-[30px]">The best journeys begin with a little care.</h2><p className="mt-2 max-w-[620px] text-xs leading-6 text-white/65">Temple schedules and local customs can change. Please confirm details with the temple before travelling, dress respectfully, and leave room for the unexpected.</p></div>
            </div>
            <a href="#discover" className="mt-5 inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-[#e3c29f] transition hover:text-white md:ml-8 md:mt-0">Plan your visit <ArrowRight size={15} /></a>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e8e3d9]">
        <div className="page-shell flex flex-col gap-3 py-6 text-[10px] text-[#8a897e] sm:flex-row sm:items-center sm:justify-between">
          <span>© Sacred India · A guide to living heritage</span>
          <span>Visitor information is a guide; please verify schedules locally.</span>
        </div>
      </footer>
    </>
  );
}

function TempleCard({ temple, index }: { temple: TempleData; index: number }) {
  return (
    <article className="temple-card overflow-hidden rounded-[22px] border border-[#ebe6dc] bg-[#fffdfa]">
      <Link href={`/temples/${temple.slug}`} className="block">
        <div className="temple-image relative h-[216px]" style={imageStyle(temple.imageUrl, index % 2 ? "center 35%" : "center")} role="img" aria-label={temple.name}>
          {temple.featured && <span className="absolute left-4 top-4 rounded-full bg-[#fff9ef]/95 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.15em] text-[#735f43]">Editor&apos;s pick</span>}
          <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-[#202c25]/75 px-3 py-1.5 text-[9px] font-medium text-white backdrop-blur-sm"><MapPin size={11} />{temple.state}</span>
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/temples/${temple.slug}`} className="serif line-clamp-1 text-[21px] font-semibold leading-tight text-[#2f3c32] hover:text-[#a7623a]">{temple.name}</Link>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#87877c]"><MapPin size={12} />{temple.city}, {temple.state}</p>
          </div>
          <SaveButton slug={temple.slug} compact />
        </div>
        <div className="my-4 h-px bg-[#eeeae2]" />
        <p className="line-clamp-2 min-h-[38px] text-[12px] leading-[1.6] text-[#77786d]">{temple.history || `A place of devotion to ${temple.deity.join(", ") || "the divine"}.`}</p>
        <div className="mt-4 flex items-center justify-between border-t border-[#f0ede6] pt-3.5">
          <span className="text-[10px] text-[#86867b]">{temple.deity.slice(0, 2).join(" · ") || "Sacred heritage"}</span>
          <Link href={`/temples/${temple.slug}`} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#516a55] hover:text-[#a7623a]">Explore <ArrowRight size={13} /></Link>
        </div>
      </div>
    </article>
  );
}
