import { CustomerModel } from "../models/customer.model";
import { RegisterCustomerDTO } from "../dtos/register.dto";

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
}

export const customerRepository = new CustomerRepository();
