import mongoose, { Schema, Document } from "mongoose";
export interface IUser extends Document {
  email: string;
  password?: string;
  isVerified?: boolean;
  tokenVerification?: string;
  avatar?: string;
  expiresAt?: Date; // for TTL deletion
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      minlength: 6,
      select: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    tokenVerification: {
      type: String,
      select: false,
    },

    // ⭐ Avatar field
    avatar: {
      type: String,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000), // set expiry time on creation
      index: { expires: 0 }, // TTL enabled
    }
  },
  { timestamps: true }
);

UserSchema.methods.markAsVerified = async function () {
  this.isVerified = true;
  this.expiresAt = undefined; // remove TTL
  await this.save();
};

export const User = mongoose.model<IUser>("User", UserSchema);
