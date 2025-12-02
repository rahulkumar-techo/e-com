/* User Repository */

import { BaseRepository } from "./base.repo";
import { User, IUser } from "../models/user.model";

class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  // Find by email (normal)
  findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).exec();
  }

  // Return ALL fields including select:false fields
  findWithHiddenFields(email: string): Promise<IUser | null> {
    return User.findOne({ email })
      .select("+password +tokenVerification +expiresAt")
      .exec();
  }

  // For login: include password only
  findUserWithCredentials(email: string): Promise<IUser | null> {
    return User.findOne({ email })
      .select("+password")
      .exec();
  }



}

export const userRepository = new UserRepository();
