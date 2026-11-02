import mongoose from "mongoose";

/** One editable setting per key: the counter, the calendar rules, the shop tabs, the lectures. */
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export const Setting = mongoose.model("Setting", settingSchema);
