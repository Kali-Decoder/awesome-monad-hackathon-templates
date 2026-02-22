import mongoose, { InferSchemaType, Model, Schema } from "mongoose";

const transactionSchema = new Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    txHash: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    action: {
      type: String,
      enum: ["scratch_reward", "claim"],
      required: true,
      index: true,
    },
    amountWei: {
      type: String,
      required: true,
    },
    chainId: {
      type: Number,
      required: true,
      index: true,
    },
    contractAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    occurredAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

transactionSchema.index({ walletAddress: 1, action: 1, occurredAt: -1 });

type TransactionDocument = InferSchemaType<typeof transactionSchema>;
type TransactionModel = Model<TransactionDocument>;

export const Transaction: TransactionModel =
  (mongoose.models.Transaction as TransactionModel) ||
  mongoose.model<TransactionDocument>("Transaction", transactionSchema);
