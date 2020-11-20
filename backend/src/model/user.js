import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, DeleteDateColumn
} from 'typeorm';
import {
  IsEmail, Length, IsString, IsUrl, IsOptional
} from 'class-validator';

@Entity({ name: 'user' })
class User {
    @PrimaryGeneratedColumn('increment', { type: 'int' })
    id;

    @Column({ name: 'email', type: 'varchar', unique: true })
    @IsEmail()
    email;

    @Column({
      name: 'name', type: 'varchar', unique: true, charset: 'utf-8'
    })
    @IsString()
    @Length(4, 20)
    name;

    @Column({ name: 'password', type: 'varchar', nullable: true })
    @IsOptional()
    @IsString()
    password;

    @Column({ name: 'profile_image', type: 'varchar' })
    @IsUrl()
    profileImage;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt;

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt;

    @DeleteDateColumn({ name: 'deleted_at', type: 'datetime' })
    deletedAt;
}

export { User };
