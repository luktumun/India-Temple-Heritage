import mongoose, { Schema, type InferSchemaType } from "mongoose";

const TempleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    state: { type: String, required: true, trim: true, maxlength: 80 },
    city: { type: String, required: true, trim: true, maxlength: 80 },
    address: { type: String, default: "", trim: true, maxlength: 300 },
    deity: { type: [String], default: [] },
    history: { type: String, default: "", maxlength: 5000 },
    darshanTimings: { type: String, default: "", maxlength: 300 },
    rituals: { type: [String], default: [] },
    festivals: { type: [String], default: [] },
    guidelines: { type: [String], default: [] },
    imageUrl: { type: String, default: "", maxlength: 600 },
    bestTimeToVisit: { type: String, default: "", maxlength: 160 },
    entryFee: { type: String, default: "Free", maxlength: 120 },
    contact: { type: String, default: "", maxlength: 160 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type TempleDocument = InferSchemaType<typeof TempleSchema>;

const Temple =
  mongoose.models.Temple || mongoose.model("Temple", TempleSchema);

export default Temple;
