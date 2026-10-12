import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import Metric from "@/lib/metric";
import Temple from "@/models/Temple";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  await connectToDatabase();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [templeCount, metrics] = await Promise.all([
    Temple.countDocuments(),
    Metric.find({ createdAt: { $gte: monthStart } }).select("kind visitorId resultCount seconds rating").lean(),
  ]);

  const searches = metrics.filter((event) => event.kind === "search");
  const successfulSearches = searches.filter((event) => (event.resultCount ?? 0) > 0);
  const visits = metrics.filter((event) => event.kind === "view");
  const engagement = metrics.filter((event) => event.kind === "engagement");
  const ratings = metrics.filter((event) => event.kind === "rating");

  return NextResponse.json({
    templeCount,
    monthlyActiveUsers: new Set(visits.map((event) => event.visitorId)).size,
    searchSuccessRate: searches.length
      ? Math.round((successfulSearches.length / searches.length) * 100)
      : null,
    averageEngagementSeconds: engagement.length
      ? Math.round(engagement.reduce((sum, event) => sum + (event.seconds ?? 0), 0) / engagement.length)
      : null,
    satisfactionScore: ratings.length
      ? Number((ratings.reduce((sum, event) => sum + (event.rating ?? 0), 0) / ratings.length).toFixed(1))
      : null,
  });
}
