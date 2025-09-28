import mongoose from "mongoose";

const transactionSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["deposit", "withdraw", "transfer"],
      required: true,
    },
    amount: { type: Number, required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // for transfers
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
