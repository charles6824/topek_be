import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  fullName: string;
  email: string;
  phone: string;
  organization?: string;
  divisionInterest?: string;
  projectScope?: string;
  budget?: string;
  message: string;
  status: 'New' | 'In-Review' | 'Contacted' | 'Closed';
  notes?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Valid email address is required'],
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [30, 'Phone cannot exceed 30 characters'],
    },
    organization: {
      type: String,
      trim: true,
      maxlength: [150, 'Organization cannot exceed 150 characters'],
    },
    divisionInterest: {
      type: String,
      trim: true,
    },
    projectScope: {
      type: String,
      trim: true,
    },
    budget: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Project brief/message is required'],
      trim: true,
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
    status: {
      type: String,
      enum: ['New', 'In-Review', 'Contacted', 'Closed'],
      default: 'New',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);
