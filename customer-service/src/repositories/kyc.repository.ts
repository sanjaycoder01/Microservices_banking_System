import { KycModel } from "../models/kyc.model";
import { SubmitKycDTO } from "../dtos/submit-kyc.dto";
import { KycStatus } from "../types";

export class KycRepository {
  async findByCustomerId(customerId: string) {
    return KycModel.findOne({ customerId });
  }

  async create(customerId: string, data: SubmitKycDTO) {
    return KycModel.create({
      customerId,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      documentUrl: data.documentUrl,
      status: "PENDING",
      submittedAt: new Date(),
      rejectionReason: undefined,
      verifiedAt: undefined,
    });
  }

  async resubmit(customerId: string, data: SubmitKycDTO) {
    return KycModel.findOneAndUpdate(
      { customerId },
      {
        $set: {
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          documentUrl: data.documentUrl,
          status: "PENDING",
          submittedAt: new Date(),
          rejectionReason: null,
          verifiedAt: null,
        },
      },
      { new: true, runValidators: true }
    );
  }

  async updateStatus(
    customerId: string,
    status: Extract<KycStatus, "VERIFIED" | "REJECTED">,
    rejectionReason?: string
  ) {
    const update: Record<string, unknown> = {
      status,
      verifiedAt: status === "VERIFIED" ? new Date() : null,
    };

    if (status === "REJECTED") {
      update.rejectionReason = rejectionReason;
    } else {
      update.rejectionReason = null;
    }

    return KycModel.findOneAndUpdate(
      { customerId },
      { $set: update },
      { new: true, runValidators: true }
    );
  }
}

export const kycRepository = new KycRepository();
