import mongoose, { Schema, Document } from "mongoose";
export interface IUser extends Document {
  email: string;
  password?: string;
  isVerified?: boolean;
  tokenVerification?: string;
  avatar?: string;
  isBlocked: boolean;
  expiresAt?: Date; 
  createdAt:Date;
  updatedAt:Date;
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
    isBlocked: {
      type: Boolean,
      default: false
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

  await this.updateOne({ $unset: { expiresAt: 1 }, $set: { isVerified: true } });
};


export const User = mongoose.model<IUser>("User", UserSchema);
