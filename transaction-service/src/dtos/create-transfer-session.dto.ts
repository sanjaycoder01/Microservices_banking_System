import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateTransferSessionDTO {
  @IsMongoId()
  sourceAccountId!: string;

  @IsMongoId()
  destinationAccountId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  currency!: string;
}
