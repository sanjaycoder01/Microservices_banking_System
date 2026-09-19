import { IsIn, IsNotEmpty, IsString, ValidateIf } from "class-validator";

export class UpdateKycStatusDTO {
  @IsIn(["VERIFIED", "REJECTED"])
  status!: "VERIFIED" | "REJECTED";

  @ValidateIf((dto: UpdateKycStatusDTO) => dto.status === "REJECTED")
  @IsString()
  @IsNotEmpty()
  rejectionReason?: string;
}
