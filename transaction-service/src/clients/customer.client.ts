import { env } from "../config/env";
import { logger } from "../config/logger";
import { AppError, CustomerSummary } from "../types";

interface CustomerApiResponse {
  message: string;
  data: CustomerSummary;
}

export class CustomerClient {
  async getAuthenticatedCustomer(token: string): Promise<CustomerSummary> {
    const url = `${env.CUSTOMER_SERVICE_URL}/internal/customers/me`;

    try {
      const response = await fetch(url, {
        headers: {
          Cookie: `accessToken=${token}`,
        },
      });

      if (response.status === 401) {
        throw new AppError(401, "Authentication required");
      }

      if (response.status === 404) {
        throw new AppError(404, "Customer not found");
      }

      if (!response.ok) {
        logger.error(
          { status: response.status },
          "Customer service request failed"
        );
        throw new AppError(502, "Customer service unavailable");
      }

      const body = (await response.json()) as CustomerApiResponse;
      return body.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error({ err: error }, "Failed to call customer service");
      throw new AppError(502, "Customer service unavailable");
    }
  }

  async getCustomerById(customerId: string): Promise<CustomerSummary> {
    const url = `${env.CUSTOMER_SERVICE_URL}/internal/customers/${customerId}`;

    try {
      const response = await fetch(url);

      if (response.status === 404) {
        throw new AppError(404, "Destination customer not found");
      }

      if (!response.ok) {
        logger.error(
          { status: response.status, customerId },
          "Customer service getById failed"
        );
        throw new AppError(502, "Customer service unavailable");
      }

      const body = (await response.json()) as CustomerApiResponse;
      return body.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error({ err: error, customerId }, "Failed to call customer service");
      throw new AppError(502, "Customer service unavailable");
    }
  }
}

export const customerClient = new CustomerClient();
