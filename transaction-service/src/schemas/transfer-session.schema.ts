import { Schema } from "mongoose";
import {
  DEFAULT_CURRENCY,
  TRANSFER_SESSION_STATUSES,
} from "../constants";

/**
 * Temporary workflow/state for one payment attempt.
 * Completing a session yields a permanent Transaction record.
 */
export const transferSessionSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    sourceAccountId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    destinationAccountId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    currency: {
      type: String,
      required: true,
      default: DEFAULT_CURRENCY,
    },

    status: {
      type: String,
      enum: TRANSFER_SESSION_STATUSES,
      required: true,
      default: "CREATED",
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

transferSessionSchema.index({ customerId: 1, createdAt: -1 });
