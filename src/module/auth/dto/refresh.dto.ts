import { Expose, plainToInstance } from "class-transformer"
import { IsString } from "class-validator"

export class RefreshTokenDTO{
    @Expose()
    @IsString()
    refreshToken:string

   
    static fromRequest(data : any){
        return plainToInstance(RefreshTokenDTO,data ,{
            excludeExtraneousValues: true,
         })
    }
   
}