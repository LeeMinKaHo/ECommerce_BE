import { plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";
import { Request } from "express";

export class FindOptionDTO{
    @IsNumber()
    @IsNotEmpty()
    categoryId : number 
    @IsNumber() 
    @IsNotEmpty() 
    minPrice : number

    @IsNumber()
    @IsNotEmpty()
    maxPrice:number
    static fromRequest(req : Request){
        return plainToInstance(FindOptionDTO , req.query )
    }
}