import { RegisterCustomerDTO } from "../dtos/register.dto";
import { LoginCustomerDTO } from "../dtos/login.dto";
import { UpdateCustomerDTO } from "../dtos/update-customer.dto";
import { customerRepository } from "../repositories/customer.repository";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { AppError, CustomerResponse } from "../types";
import { logger } from "../config/logger";

const toCustomerResponse = (customer: {
  _id: { toString(): string };
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: {
    line1?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
  } | null;
  role: string;
  status: string;
  kycStatus: string;
  createdAt: Date;
  updatedAt: Date;
}): CustomerResponse => ({
  id: customer._id.toString(),
  email: customer.email,
  firstName: customer.firstName,
  lastName: customer.lastName,
  phone: customer.phone ?? undefined,
  address: customer.address
    ? {
        line1: customer.address.line1 ?? undefined,
        city: customer.address.city ?? undefined,
        state: customer.address.state ?? undefined,
        postalCode: customer.address.postalCode ?? undefined,
      }
    : undefined,
  role: customer.role as CustomerResponse["role"],
  status: customer.status as CustomerResponse["status"],
  kycStatus: customer.kycStatus as CustomerResponse["kycStatus"],
  createdAt: customer.createdAt,
  updatedAt: customer.updatedAt,
});

export class CustomerService {
  async register(dto: RegisterCustomerDTO): Promise<CustomerResponse> {
    try {
      const existing = await customerRepository.findByEmail(dto.email);
      if (existing) {
        throw new AppError(409, "Email already registered");
      }

      const passwordHash = await hashPassword(dto.password);
      const customer = await customerRepository.create({
        ...dto,
        passwordHash,
      });

      logger.info(
        { customerId: customer._id.toString(), email: customer.email },
        "Customer registered"
      );

      return toCustomerResponse(customer);
    } catch (error) {
      if (!(error instanceof AppError)) {
        logger.error({ err: error, email: dto.email }, "Customer registration failed");
      }
      throw error;
    }
  }

  async login(
    dto: LoginCustomerDTO
  ): Promise<{ customer: CustomerResponse; token: string }> {
    try {
      const customer = await customerRepository.findByEmail(dto.email);
      if (!customer) {
        throw new AppError(401, "Invalid email or password");
      }

      if (customer.status === "BLOCKED") {
        throw new AppError(403, "Account is blocked");
      }

      const isValid = await comparePassword(dto.password, customer.passwordHash);
      if (!isValid) {
        throw new AppError(401, "Invalid email or password");
      }

      const token = signToken({
        sub: customer._id.toString(),
        email: customer.email,
        role: customer.role as CustomerResponse["role"],
      });

      logger.info(
        { customerId: customer._id.toString() },
        "Customer logged in"
      );

      return {
        customer: toCustomerResponse(customer),
        token,
      };
    } catch (error) {
      if (!(error instanceof AppError)) {
        logger.error({ err: error }, "Customer login failed");
      }
      throw error;
    }
  }

  async getMe(customerId: string): Promise<CustomerResponse> {
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new AppError(404, "Customer not found");
    }

    return toCustomerResponse(customer);
  }

  async updateMe(
    customerId: string,
    dto: UpdateCustomerDTO
  ): Promise<CustomerResponse> {
    try {
      const customer = await customerRepository.updateById(customerId, dto);
      if (!customer) {
        throw new AppError(404, "Customer not found");
      }

      logger.info({ customerId }, "Customer profile updated");

      return toCustomerResponse(customer);
    } catch (error) {
      if (!(error instanceof AppError)) {
        logger.error({ err: error, customerId }, "Customer profile update failed");
      }
      throw error;
    }
  }
}

export const customerService = new CustomerService();
