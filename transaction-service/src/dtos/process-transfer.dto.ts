import { IsNotEmpty, IsString } from "class-validator";

export class ProcessTransferDTO {
  @IsString()
  @IsNotEmpty()
  sessionId!: string;
}
