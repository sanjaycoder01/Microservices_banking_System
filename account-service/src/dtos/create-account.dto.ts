import { IsEnum } from "class-validator";

export class CreateAccountDTO {
  @IsEnum(["SAVINGS", "CURRENT"])
  accountType!: "SAVINGS" | "CURRENT";
}
