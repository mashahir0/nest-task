import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private usersRepo;
    private saltRounds;
    constructor(usersRepo: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(query: {
        search?: string;
        role?: string;
        page?: number;
        limit?: number;
        sort?: string;
    }): Promise<{
        data: {
            id: number;
            name: string;
            email: string;
            role: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        email: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEmail(email: string): Promise<User>;
    update(id: number, updateDto: UpdateUserDto): Promise<{
        id: number;
        name: string;
        email: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
