import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ["commitment", "school", "ambassador", "contact", "quote", "donate", "newsletter", "story", "school_order"],
      required: true,
    },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    sourcePath: { type: String, default: "" },
    /** Stories only: whether the team chose to show it on the Stories page. */
    shown: { type: Boolean, default: false },
  },
  { timestamps: true },
);

submissionSchema.index(
  { kind: 1, "payload.emailNormalized": 1 },
  {
    unique: true,
    partialFilterExpression: {
      kind: "commitment",
      "payload.emailNormalized": { $type: "string" },
    },
  },
);

export const Submission = mongoose.model("Submission", submissionSchema);
