import mongoose from "mongoose";
import { transferSessionSchema } from "../schemas/transfer-session.schema";

export const TransferSessionModel = mongoose.model(
  "TransferSession",
  transferSessionSchema
);
