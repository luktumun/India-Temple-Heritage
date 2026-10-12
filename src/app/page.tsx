import { TempleExplorer } from "@/components/TempleExplorer";
import { findTemples } from "@/lib/temples";
import { connection } from "next/server";
import { Suspense } from "react";

export default function Home() {
  return <Suspense fallback={<PortalLoading />}>
    <TempleContent />
  </Suspense>;
}

async function TempleContent() {
  await connection();
  const temples = await findTemples();
  return <TempleExplorer temples={temples} />;
}

function PortalLoading() {
  return <main className="page-shell py-24">
    <div className="eyebrow">A living heritage guide</div>
    <h1 className="serif mt-4 text-5xl text-[#29392f]">Find your way to the sacred.</h1>
    <p className="mt-4 text-sm text-[#7b7b71]">Opening the temple collection…</p>
  </main>;
}
