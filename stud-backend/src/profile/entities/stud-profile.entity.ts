import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('stud_profiles')
export class StudProfile {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        name: 'stud_id',
        type: 'integer',
        unique: true,
    })
    studId!: number;

    @Column({
        type: 'varchar',
        length: 42,
        unique: true,
    })
    wallet!: string;

    @Column({
        type: 'varchar',
        length: 64,
    })
    name!: string;

    @Column({
        type: 'smallint',
    })
    age!: number;

    @Column({
        type: 'varchar',
        length: 16,
    })
    gender!: string;

    @Column({
        type: 'varchar',
        length: 16,
    })
    preference!: string;

    @Column({
        type: 'varchar',
        length: 280,
        default: '',
    })
    bio!: string;

    @Column({
        type: 'text',
        array: true,
    })
    interests!: string[];

    @Column({
        name: 'profile_image',
        type: 'text',
    })
    profileImage!: string;

    @CreateDateColumn({
        name: 'created_at',
    })
    createdAt!: Date;

    @UpdateDateColumn({
        name: 'updated_at',
    })
    updatedAt!: Date;
}