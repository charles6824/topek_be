import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'superadmin' | 'editor';
  failedLoginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['superadmin', 'editor'],
      default: 'editor',
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify candidate password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const user = this as IUser;
  return bcrypt.compare(candidatePassword, user.passwordHash);
};

// Check if account is temporarily locked
UserSchema.methods.isLocked = function (): boolean {
  const user = this as IUser;
  return !!(user.lockUntil && user.lockUntil.getTime() > Date.now());
};

// Increment login attempts & lock if >= 5 attempts
UserSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  const user = this as IUser;
  const attempts = user.failedLoginAttempts + 1;
  const updates: Record<string, unknown> = { failedLoginAttempts: attempts };

  // Lock for 15 minutes after 5 consecutive failures
  if (attempts >= 5) {
    updates.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
  }

  await user.updateOne(updates);
};

// Reset login attempts on successful authentication
UserSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  const user = this as IUser;
  await user.updateOne({
    $set: { failedLoginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 },
  });
};

export const User = mongoose.model<IUser>('User', UserSchema);
