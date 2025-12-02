import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISession extends Document {
  userId: Types.ObjectId;
  refreshToken: string;
  device: string;
  ip: string;
  userAgent: string;
  lastUsed: Date;
}

export type SessionCreateInput = {
  userId: Types.ObjectId;
  refreshToken: string;
  device: string;
  ip: string;
  userAgent: string;
  lastUsed: Date;
};

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    refreshToken: { type: String, required: true },
    device: { type: String, required: true },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    lastUsed: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Session = mongoose.model<ISession>("Session", SessionSchema);
