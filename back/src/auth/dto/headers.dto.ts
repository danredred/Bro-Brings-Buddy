import { IsHash } from "class-validator";

export class tokenHeaderDto{
    @IsHash('sha256')
    token:string
}