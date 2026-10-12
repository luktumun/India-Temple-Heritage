import type { Metadata } from "next";
import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata: Metadata = { title: "Temple administration" };

export default function AdminPage() {
  return <AdminDashboard />;
}
