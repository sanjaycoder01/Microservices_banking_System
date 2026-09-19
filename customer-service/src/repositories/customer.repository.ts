import { CustomerModel } from "../models/customer.model";
import { RegisterCustomerDTO } from "../dtos/register.dto";
import { UpdateCustomerDTO } from "../dtos/update-customer.dto";
import { KycStatus } from "../types";

export class CustomerRepository {
  async findByEmail(email: string) {
    return CustomerModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string) {
    return CustomerModel.findById(id);
  }

  async create(data: RegisterCustomerDTO & { passwordHash: string }) {
    const { password: _password, ...rest } = data;
    return CustomerModel.create({
      email: rest.email.toLowerCase(),
      passwordHash: rest.passwordHash,
      firstName: rest.firstName,
      lastName: rest.lastName,
      phone: rest.phone,
    });
  }

  async updateById(id: string, data: UpdateCustomerDTO) {
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );

    return CustomerModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async updateKycStatus(id: string, kycStatus: KycStatus) {
    return CustomerModel.findByIdAndUpdate(
      id,
      { $set: { kycStatus } },
      { new: true, runValidators: true }
    );
  }
}

export const customerRepository = new CustomerRepository();
