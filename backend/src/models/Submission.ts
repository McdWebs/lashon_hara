import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ["commitment", "school", "ambassador", "contact", "quote", "donate", "newsletter"],
      required: true,
    },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    sourcePath: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Submission = mongoose.model("Submission", submissionSchema);
