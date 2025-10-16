"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
let UsersService = class UsersService {
    constructor(usersRepo) {
        this.usersRepo = usersRepo;
        this.saltRounds = Number(process.env.SALT_ROUNDS || 10);
    }
    async create(createUserDto) {
        const existing = await this.usersRepo.findOne({ where: { email: createUserDto.email } });
        if (existing)
            throw new common_1.BadRequestException('Email already exists');
        const hashed = await bcrypt.hash(createUserDto.password, this.saltRounds);
        const user = this.usersRepo.create({ ...createUserDto, password: hashed, role: createUserDto.role || 'user' });
        return this.usersRepo.save(user);
    }
    async findAll(query) {
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
            const allowed = ['name', 'email', 'createdAt', 'updatedAt', 'role', 'id'];
            if (allowed.includes(col)) {
                qb.orderBy(`user.${col}`, order || 'ASC');
            }
        }
        else {
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
    async findOne(id) {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const { password, ...rest } = user;
        return rest;
    }
    async findByEmail(email) {
        return this.usersRepo.findOne({ where: { email } });
    }
    async update(id, updateDto) {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (updateDto.email && updateDto.email !== user.email) {
            const exists = await this.usersRepo.findOne({ where: { email: updateDto.email } });
            if (exists)
                throw new common_1.BadRequestException('Email already in use');
        }
        if (updateDto.password) {
            updateDto.password = await bcrypt.hash(updateDto.password, this.saltRounds);
        }
        const merged = this.usersRepo.merge(user, updateDto);
        const saved = await this.usersRepo.save(merged);
        const { password, ...rest } = saved;
        return rest;
    }
    async remove(id) {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.usersRepo.remove(user);
        return { success: true };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map