import { model, InferSchemaType, Types } from "mongoose";
import { kycSchema } from "../schemas/kyc.schema";

export type KycDocument = InferSchemaType<typeof kycSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const KycModel = model("Kyc", kycSchema);
