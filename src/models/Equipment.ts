import mongoose, { Schema, Document } from 'mongoose';

export interface IEquipment extends Document {
  name: string;
  category: 'Earthmoving' | 'Lifting & Cranes' | 'Concrete & Paving' | 'Haulage & Logistics' | 'Survey & Testing' | 'Power & Welding';
  quantity: string;
  specifications: string;
  status: 'Operational' | 'Mobilized' | 'Under Maintenance';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentSchema = new Schema<IEquipment>(
  {
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Earthmoving', 'Lifting & Cranes', 'Concrete & Paving', 'Haulage & Logistics', 'Survey & Testing', 'Power & Welding'],
      index: true,
    },
    quantity: {
      type: String,
      required: true,
      trim: true,
    },
    specifications: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Operational', 'Mobilized', 'Under Maintenance'],
      default: 'Operational',
      index: true,
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

export const Equipment = mongoose.model<IEquipment>('Equipment', EquipmentSchema);
