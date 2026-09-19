import { Schema } from "mongoose";

export const accountSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },

    accountType: {
      type: String,
      enum: ["SAVINGS", "CURRENT"],
      required: true,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "BLOCKED", "CLOSED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);
