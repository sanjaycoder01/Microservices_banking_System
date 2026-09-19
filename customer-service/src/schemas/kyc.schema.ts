import { Schema } from "mongoose";

export const kycSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,
      index: true,
    },

    documentType: {
      type: String,
      required: true,
    },

    documentNumber: {
      type: String,
      required: true,
    },

    documentUrl: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },

    rejectionReason: {
      type: String,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);
