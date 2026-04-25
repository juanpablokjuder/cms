import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/utils/app-error.js';
import { UserRepository } from './user.repository.js';
import type { PaginatedResult, PaginationOptions, PublicUser } from '../../shared/types/index.js';
import type { CreateUserDTO } from './dtos/create-user.dto.js';
import type { UpdateUserDTO } from './dtos/update-user.dto.js';

export class UserService {
  private readonly repo: UserRepository;

  constructor() {
    this.repo = new UserRepository();
  }

  /**
   * Paginated user list.
   * page and limit are validated at the controller level before arriving here.
   */
  async list(opts: PaginationOptions): Promise<PaginatedResult<PublicUser>> {
    return this.repo.findAll(opts);
  }

  /**
   * Get a single user by UUID.
   */
  async findByUuid(uuid: string): Promise<PublicUser> {
    return this.repo.findByUuid(uuid);
  }

  /**
   * Create a new user.
   * - Validates email uniqueness (conflict guard)
   * - Hashes the plain-text password before storage
   */
  async create(dto: CreateUserDTO): Promise<PublicUser> {
    const emailTaken = await this.repo.emailExists(dto.email);

    if (emailTaken) {
      throw AppError.conflict('A user with this email address already exists.');
    }

    const password_hash = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);

    return this.repo.create({
      uuid: uuidv4(),
      name: dto.name,
      email: dto.email,
      password_hash,
      role: dto.role,
    });
  }

  /**
   * Partial update of a user.
   * - Guards against email conflicts
   * - If a new password is provided, hashes it before storage
   */
  async update(uuid: string, dto: UpdateUserDTO): Promise<PublicUser> {
    // Ensure the user actually exists before proceeding.
    await this.repo.findByUuid(uuid);

    if (dto.email) {
      const emailTaken = await this.repo.emailExists(dto.email, uuid);
      if (emailTaken) {
        throw AppError.conflict('This email address is already in use.');
      }
    }

    let password_hash: string | undefined;
    if (dto.password) {
      password_hash = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);
    }

    return this.repo.update(uuid, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(password_hash !== undefined ? { password_hash } : {}),
      ...(dto.role !== undefined ? { role: dto.role } : {}),
      ...(dto.is_active !== undefined ? { is_active: dto.is_active ? 1 : 0 } : {}),
    });
  }

  /**
   * Soft-delete a user.
   * Admins cannot delete themselves to prevent lock-out.
   */
  async delete(uuid: string, requestingUserUuid: string): Promise<void> {
    if (uuid === requestingUserUuid) {
      throw AppError.badRequest('You cannot delete your own account.');
    }

    await this.repo.softDelete(uuid);
  }
}
