/* User Repository */

import { BaseRepository } from "./base.repo";
import { User, IUser } from "../models/user.model";

class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  // Custom method: find by email
  findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).exec();
  }
}

export const userRepository = new UserRepository();
