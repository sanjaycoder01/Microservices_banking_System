import mongoose from "mongoose";
import { transactionSchema } from "../schemas/transaction.schema";

export const TransactionModel = mongoose.model("Transaction", transactionSchema);
