import { Gender } from "./genter.enum";

export interface LoginRequest {
    userName:string;
    password:string;
}


export interface UserRegisterDto {
  firstName:string;
  lastName:string;
  gender: Gender;
  email: string;
  password: string;
  confirmPassword?: string;
  birthDate: string;
 
}