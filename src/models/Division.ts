import mongoose, { Schema, Document } from 'mongoose';

export interface IDivision extends Document {
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  fullDescription: string;
  capabilities: string[];
  icon: string;
  image: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const DivisionSchema = new Schema<IDivision>(
  {
    number: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 8,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Division title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },
    fullDescription: {
      type: String,
      required: true,
      trim: true,
    },
    capabilities: {
      type: [String],
      default: [],
    },
    icon: {
      type: String,
      default: 'Buildings',
    },
    image: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Division = mongoose.model<IDivision>('Division', DivisionSchema);
