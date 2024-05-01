import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SignInDto, SignUpDto, createUserResponse } from "./dto";
import * as argon from "argon2";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService
    ) { }

    async signup(dto: SignUpDto) {
        try {
            //hash the password
            const hash = await argon.hash(dto.password)
            //user creation
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    wallet: {
                        create: { balance: 0 }
                    }
                },
            });

            //send the customised user back with token
            const userResponse = createUserResponse(user)
            userResponse.token = await this.signToken(user.id, user.email)
            return userResponse;

        } catch (error) {

            //user already exists error
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credentials already taken')
                }
            }

            throw new Error('Signup failed: ' + error.message);

        }
    }

    async login(dto: SignInDto) {
        try {

            //find user by email
            const user = await this.prisma.user.findUnique({
                where: {
                    email: dto.email,
                }
            })

            //if user does not exist throw exception
            if (!user) throw new ForbiddenException("Incorrect credentials");

            //compare password
            const passwordMatches = await argon.verify(user.hash, dto.password);

            //if password incorrect throw exception 
            if (!passwordMatches) throw new ForbiddenException("Incorrect credentials");

            //send the customised user back with token
            const userResponse = createUserResponse(user)
            userResponse.token = await this.signToken(user.id, user.email)
            return userResponse;
        } catch (error) {
            if (error instanceof ForbiddenException) {
                throw error; // Re-throw custom error for correct response other wise it will throw the error in the catch block
            } else {
                throw new Error("Signin failed: " + error.message);
            }
        }

    }

    signToken(userId: number, email: string): Promise<string> {
        try {
            const payload = {
                sub: userId,
                email
            }
            const secret = this.config.get('JWT_SECRET')
            return this.jwt.signAsync(payload, {
                expiresIn: '30min',
                secret: secret,
            })

        } catch (error) {
            throw new Error("token generation failed: " + error.message);

        }

    }
}
