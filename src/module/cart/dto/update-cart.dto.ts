import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateCartDTO {
    @IsString()
    @IsNotEmpty()
    cartItemId: string;
    @IsNumber()
    @IsNotEmpty()
    quantity: number;
    static fromRequest(data: any): UpdateCartDTO {
        return Object.assign(new UpdateCartDTO(), data);
    }
}