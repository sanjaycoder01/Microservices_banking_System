import { model, InferSchemaType } from "mongoose";
import { customerSchema } from "../schemas/customer.schema";

export type CustomerDocument = InferSchemaType<typeof customerSchema> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

export const CustomerModel = model("Customer", customerSchema);
