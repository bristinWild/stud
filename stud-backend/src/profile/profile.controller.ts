import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
} from '@nestjs/common';

import {
    ProfileService,
    type SaveProfileInput,
} from './profile.service.js';


@Controller('profiles')
export class ProfileController {
    constructor(
        private readonly profileService:
            ProfileService,
    ) { }


    @Post()
    saveProfile(
        @Body()
        body:
            SaveProfileInput,
    ) {
        return this.profileService
            .saveProfile(
                body,
            );
    }


    @Get('discover')
    discover(
        @Query('wallet')
        wallet:
            string,
    ) {
        return this.profileService
            .getDiscoverProfiles(
                wallet,
            );
    }


    @Get('wallet/:wallet')
    getProfile(
        @Param('wallet')
        wallet:
            string,
    ) {
        return this.profileService
            .getProfileByWallet(
                wallet,
            );
    }
}