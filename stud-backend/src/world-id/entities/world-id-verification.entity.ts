import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';

@Entity('world_id_verifications')
@Unique(
    'UQ_world_id_action_nullifier',
    ['action', 'nullifier'],
)
@Index(
    'UQ_world_id_action_wallet',
    ['action', 'wallet'],
    {
        unique: true,
    },
)
export class WorldIdVerification {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'varchar',
        length: 64,
    })
    action!: string;

    @Column({
        type: 'numeric',
        precision: 78,
        scale: 0,
    })
    nullifier!: string;

    @Column({
        type: 'varchar',
        length: 42,
    })
    wallet!: string;

    @CreateDateColumn({
        name: 'verified_at',
    })
    verifiedAt!: Date;
}