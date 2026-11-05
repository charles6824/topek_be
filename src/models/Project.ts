import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  client: string;
  scope: string;
  location: string;
  year?: string;
  status: 'Ongoing' | 'Completed';
  category: 'civil-infrastructure' | 'gas-energy' | 'industrial-commercial' | 'specialized';
  division?: string;
  featured: boolean;
  mainImage: string;
  galleryImages: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    client: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [150, 'Client name cannot exceed 150 characters'],
    },
    scope: {
      type: String,
      required: [true, 'Project scope description is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [120, 'Location cannot exceed 120 characters'],
    },
    year: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Ongoing', 'Completed'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['civil-infrastructure', 'gas-energy', 'industrial-commercial', 'specialized'],
      required: true,
      index: true,
    },
    division: {
      type: String,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    mainImage: {
      type: String,
      required: [true, 'Main project image URL or path is required'],
      trim: true,
    },
    galleryImages: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ status: 1, category: 1, order: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
