import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignUpDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    password: string;
    @IsNotEmpty()
    @IsString()
    firstName: string;
    @IsNotEmpty()
    @IsString()
    lastName?: string;
}

export class SignInDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    password: string;
}

export interface UserResponse {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    token?: string | undefined;
}


export function createUserResponse(user: any): UserResponse {
    const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
    };
    return userResponse;
}
