import mongoose, { Schema, Document } from "mongoose";

// Define the Admin Document interface
export interface IAdmin extends Document {
  name: string;
  email: string;
  designation: string;
  phoneNumber: string;
  gender: "male" | "female" | "other";
  
  // Account metadata
 
  password?: string;
  accountStatus: "active" | "inactive" | "blocked";
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

// Create the schema
const adminSchema = new Schema<IAdmin>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      lowercase: true 
    },
    designation: { 
      type: String, 
      required: true 
    },
    phoneNumber: { 
      type: String, 
      required: true 
    },
    gender: { 
      type: String, 
      enum: ["male", "female", "other"], 
      required: true 
    },
    

    password: { 
      type: String, 
      required: true, 
      select: false // Don't include in query results unless explicitly requested
    },
    accountStatus: { 
      type: String, 
      enum: ["active", "inactive", "blocked"],
      default: "active"
    },
    lastLogin: { 
      type: Date 
    }
  },
  { 
    timestamps: true 
  }
);

// Create and export the model
export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>("Admin", adminSchema);