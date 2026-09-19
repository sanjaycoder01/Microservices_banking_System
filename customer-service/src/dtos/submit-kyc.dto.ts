import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class SubmitKycDTO {
  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  documentNumber!: string;

  @IsUrl()
  documentUrl!: string;
}
