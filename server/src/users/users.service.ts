import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository, ILike } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class UsersService {
  private saltRounds = Number(process.env.SALT_ROUNDS || 10);

  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepo.findOne({ where: { email: createUserDto.email } });
    if (existing) throw new BadRequestException('Email already exists');

    const hashed = await bcrypt.hash(createUserDto.password, this.saltRounds);
    const user = this.usersRepo.create({ ...createUserDto, password: hashed, role: createUserDto.role || 'user' });
    return this.usersRepo.save(user);
  }

  async findAll(query: { search?: string; role?: string; page?: number; limit?: number; sort?: string }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 10;
    const skip = (page - 1) * limit;

    const qb = this.usersRepo.createQueryBuilder('user');

    if (query.search) {
      qb.andWhere('(user.name ILIKE :q OR user.email ILIKE :q)', { q: `%${query.search}%` });
    }

    if (query.role) {
      qb.andWhere('user.role = :role', { role: query.role });
    }

    if (query.sort) {
      const [col, order] = query.sort.split(':');
      // basic safety for column name
      const allowed = ['name', 'email', 'createdAt', 'updatedAt', 'role', 'id'];
      if (allowed.includes(col)) {
        qb.orderBy(`user.${col}`, (order as 'ASC' | 'DESC') || 'ASC');
      }
    } else {
      qb.orderBy('user.createdAt', 'DESC');
    }

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items.map(u => {
        const { password, ...rest } = u;
        return rest;
      }),
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...rest } = user;
    return rest;
  }

  async findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  async update(id: number, updateDto: UpdateUserDto) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (updateDto.email && updateDto.email !== user.email) {
      const exists = await this.usersRepo.findOne({ where: { email: updateDto.email } });
      if (exists) throw new BadRequestException('Email already in use');
    }
    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, this.saltRounds);
    }
    const merged = this.usersRepo.merge(user, updateDto as any);
    const saved = await this.usersRepo.save(merged);
    const { password, ...rest } = saved;
    return rest;
  }

  async remove(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepo.remove(user);
    return { success: true };
  }
}
