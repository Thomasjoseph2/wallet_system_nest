import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtGuard } from '../auth/guard';
@Controller('users')
export class UserController {

    @UseGuards(JwtGuard)
    @Get('profile')
    getMe(@Req() req: Request) {
        try {
            return req.user
        } catch (error) {
            throw new Error("action failed: " + error.message);

        }
    }
}
