import { IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class AddressDTO {
  @IsOptional()
  @IsString()
  line1?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;
}

export class UpdateCustomerDTO {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDTO)
  address?: AddressDTO;
}
