import { SubmitKycDTO } from "../dtos/submit-kyc.dto";
import { UpdateKycStatusDTO } from "../dtos/update-kyc-status.dto";
import { kycRepository } from "../repositories/kyc.repository";
import { customerRepository } from "../repositories/customer.repository";
import { AppError, KycResponse } from "../types";

const toKycResponse = (kyc: {
  _id: { toString(): string };
  customerId: { toString(): string };
  documentType: string;
  documentNumber: string;
  documentUrl: string;
  status: string;
  rejectionReason?: string | null;
  submittedAt?: Date | null;
  verifiedAt?: Date | null;
}): KycResponse => ({
  id: kyc._id.toString(),
  customerId: kyc.customerId.toString(),
  documentType: kyc.documentType,
  documentNumber: kyc.documentNumber,
  documentUrl: kyc.documentUrl,
  status: kyc.status as KycResponse["status"],
  rejectionReason: kyc.rejectionReason ?? undefined,
  submittedAt: kyc.submittedAt ?? undefined,
  verifiedAt: kyc.verifiedAt ?? undefined,
});

export class KycService {
  async submit(customerId: string, dto: SubmitKycDTO): Promise<KycResponse> {
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new AppError(404, "Customer not found");
    }

    const existing = await kycRepository.findByCustomerId(customerId);

    if (existing?.status === "VERIFIED") {
      throw new AppError(409, "KYC already verified");
    }

    if (existing?.status === "PENDING") {
      throw new AppError(409, "KYC already submitted and pending review");
    }

    const kyc = existing
      ? await kycRepository.resubmit(customerId, dto)
      : await kycRepository.create(customerId, dto);

    if (!kyc) {
      throw new AppError(500, "Failed to submit KYC");
    }

    await customerRepository.updateKycStatus(customerId, "PENDING");

    return toKycResponse(kyc);
  }

  async getByCustomerId(customerId: string): Promise<KycResponse> {
    const kyc = await kycRepository.findByCustomerId(customerId);
    if (!kyc) {
      throw new AppError(404, "KYC record not found");
    }

    return toKycResponse(kyc);
  }

  async updateStatus(
    customerId: string,
    dto: UpdateKycStatusDTO
  ): Promise<KycResponse> {
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new AppError(404, "Customer not found");
    }

    const existing = await kycRepository.findByCustomerId(customerId);
    if (!existing) {
      throw new AppError(404, "KYC record not found");
    }

    if (existing.status !== "PENDING") {
      throw new AppError(409, "Only pending KYC can be reviewed");
    }

    const kyc = await kycRepository.updateStatus(
      customerId,
      dto.status,
      dto.rejectionReason
    );

    if (!kyc) {
      throw new AppError(500, "Failed to update KYC status");
    }

    await customerRepository.updateKycStatus(customerId, dto.status);

    return toKycResponse(kyc);
  }
}

export const kycService = new KycService();
