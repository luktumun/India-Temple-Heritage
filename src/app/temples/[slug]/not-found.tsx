import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function TempleNotFound() {
  return <main className="page-shell flex min-h-screen flex-col items-center justify-center text-center">
    <span className="flex size-14 items-center justify-center rounded-full bg-[#e9e6dc] text-[#657568]"><Compass /></span>
    <h1 className="serif mt-5 text-4xl text-[#2f4034]">This place isn’t on the map yet.</h1>
    <p className="mt-3 max-w-md text-sm leading-6 text-[#7b7b71]">The temple guide may have moved, or it is still being prepared.</p>
    <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#344c3c] px-5 py-3 text-xs font-semibold text-white"><ArrowLeft size={14} /> Back to discovery</Link>
  </main>;
}
