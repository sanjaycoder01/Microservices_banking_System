import { Schema } from "mongoose";
import {
  DEFAULT_CURRENCY,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
} from "../constants";

/**
 * Permanent financial record.
 * Does not store balances — Account Service owns those.
 */
export const transactionSchema = new Schema(
  {
    transactionId: {
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
      index: true,
    },

    destinationAccountId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: TRANSACTION_TYPES,
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
      enum: TRANSACTION_STATUSES,
      required: true,
      default: "PENDING",
      index: true,
    },

    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ customerId: 1, createdAt: -1 });
transactionSchema.index({ sourceAccountId: 1, createdAt: -1 });
