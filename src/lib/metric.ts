import mongoose, { Schema } from "mongoose";

export type MetricKind = "view" | "search" | "engagement" | "rating";

const MetricSchema = new Schema(
  {
    kind: { type: String, enum: ["view", "search", "engagement", "rating"], required: true },
    visitorId: { type: String, required: true, maxlength: 64 },
    templeSlug: { type: String, maxlength: 120 },
    query: { type: String, maxlength: 160 },
    resultCount: { type: Number, min: 0, max: 100000 },
    seconds: { type: Number, min: 0, max: 86400 },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true },
);

MetricSchema.index({ createdAt: 1, kind: 1 });

const Metric =
  mongoose.models.Metric || mongoose.model("Metric", MetricSchema);

export default Metric;
