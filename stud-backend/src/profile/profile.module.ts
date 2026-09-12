import {
    Module,
} from '@nestjs/common';

import {
    TypeOrmModule,
} from '@nestjs/typeorm';

import {
    StudProfile,
} from './entities/stud-profile.entity.js';

import {
    ProfileController,
} from './profile.controller.js';

import {
    ProfileService,
} from './profile.service.js';


@Module({
    imports: [
        TypeOrmModule
            .forFeature([
                StudProfile,
            ]),
    ],

    controllers: [
        ProfileController,
    ],

    providers: [
        ProfileService,
    ],

    exports: [
        ProfileService,
    ],
})
export class ProfileModule { }