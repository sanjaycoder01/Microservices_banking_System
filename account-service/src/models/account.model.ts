import mongoose from "mongoose";
import { accountSchema } from "../schemas/account.schema";

export const AccountModel = mongoose.model("Account", accountSchema);
