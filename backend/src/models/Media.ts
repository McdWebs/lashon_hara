import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    world: { type: String, enum: ["idf", "ambassadors"], required: true, index: true },
    kind: { type: String, enum: ["photo", "video"], required: true },
    url: { type: String, required: true },
    /** Object name in the R2 bucket, so the file can be deleted with its entry. */
    key: { type: String, required: true },
    caption: { type: String, default: "", maxlength: 300 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Media = mongoose.model("Media", mediaSchema);
