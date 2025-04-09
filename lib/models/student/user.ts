// import { ObjectId } from "mongodb";

// // Types for social media links
// interface SocialMedia {
//   linkedin?: string;
//   github?: string;
//   twitter?: string;
//   portfolio?: string;
// }

// // Types for educational details
// interface Education {
//   tenthMarks: number;
//   twelfthMarks: number;
// }

// // Types for placement information
// interface PlacementInfo {
//   placed: boolean;
//   package?: number;  // in LPA or as per your requirement
//   type?: "intern" | "fte" | "both";
//   company?: string;
//   offerDate?: Date;
// }

// // Main user interface
// export interface User {
//   _id?: ObjectId;
//   name: string;
//   email: string;
  
//   // Academic details
//   branch: string;
//   cgpa: number;
//   activeBacklogs: number;
  
//   // Personal details
//   gender: "male" | "female" | "other";
//   hometown: string;
//   dob: Date;
//   photo?: string;  // URL to photo storage
  
//   // Social profiles
//   socialMedia: SocialMedia;
  
//   // Education history
//   education: Education;
  
//   // Placement status
//   placement: PlacementInfo;
  
//   // Account metadata
//   accountStatus: "active" | "inactive" | "blocked";
//   createdAt: Date;
//   updatedAt?: Date;
// }

// // User Model with collection helpers
// export const UserModel = {
//   collectionName: "users",
  
//   // Find user by email
//   findByEmail: async (db: any, email: string) => {
//     return await db.collection(UserModel.collectionName).findOne({ email });
//   },
  
//   // Find user by ID
//   findById: async (db: any, id: string | ObjectId) => {
//     if (typeof id === 'string') id = new ObjectId(id);
//     return await db.collection(UserModel.collectionName).findOne({ _id: id });
//   },
  
//   // Create new user
//   create: async (db: any, userData: Omit<User, "_id" | "createdAt" | "updatedAt">) => {
//     return await db.collection(UserModel.collectionName).insertOne({
//       ...userData,
//       accountStatus: "active",
//       createdAt: new Date()
//     });
//   },
  
//   // Update user
//   update: async (db: any, id: string | ObjectId, userData: Partial<User>) => {
//     if (typeof id === 'string') id = new ObjectId(id);
//     return await db.collection(UserModel.collectionName).updateOne(
//       { _id: id },
//       { 
//         $set: {
//           ...userData,
//           updatedAt: new Date()
//         }
//       }
//     );
//   },
  
//   // Get placed students
//   getPlacedStudents: async (db: any, query: any = {}) => {
//     return await db.collection(UserModel.collectionName)
//       .find({ 
//         "placement.placed": true,
//         ...query 
//       })
//       .toArray();
//   },
  
//   // Statistics for dashboard
//   getPlacementStats: async (db: any) => {
//     return await db.collection(UserModel.collectionName).aggregate([
//       {
//         $group: {
//           _id: "$placement.placed",
//           count: { $sum: 1 },
//           avgPackage: { 
//             $avg: {
//               $cond: [
//                 { $eq: ["$placement.placed", true] },
//                 "$placement.package",
//                 0
//               ]
//             }
//           }
//         }
//       }
//     ]).toArray();
//   },
  
//   // Filter users by various criteria
//   findUsers: async (db: any, filters: any = {}) => {
//     const query: any = {};
    
//     if (filters.branch) query.branch = filters.branch;
//     if (filters.minCgpa) query.cgpa = { $gte: filters.minCgpa };
//     if (filters.placed !== undefined) query["placement.placed"] = filters.placed;
//     if (filters.noBacklogs) query.activeBacklogs = 0;
    
//     return await db.collection(UserModel.collectionName)
//       .find(query)
//       .sort({ name: 1 })
//       .toArray();
//   }
// };


import mongoose, { Schema, Document } from "mongoose";

// Define the User Document interface
export interface IUser extends Document {
  name: string;
  email: string;
  branch: string;
  phoneNumber: string;
  cgpa: number;
  activeBacklogs: number;
  gender: "male" | "female" | "other";
  hometown: string;
  dob: Date;
  photo?: string;
  socialMedia: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  };
  education: {
    tenthMarks: number;
    twelfthMarks: number;
  };
  placement: {
    placed: boolean;
    package?: number;
    type?: "intern" | "fte" | "both";
    company?: string;
    offerDate?: Date;
  };
  accountStatus: "active" | "inactive" | "blocked";
  createdAt: Date;
  updatedAt?: Date;
}

// Create the schema
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    
    // Academic details
    branch: { type: String, required: true },
    cgpa: { type: Number, required: true },
    activeBacklogs: { type: Number, default: 0 },
    phoneNumber: { type: String, required: true },
    // Personal details
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    hometown: { type: String, required: true },
    dob: { type: Date, required: true },
    photo: { type: String },
    
    // Social Media
    socialMedia: {
      linkedin: { type: String },
      github: { type: String },
      twitter: { type: String },
      portfolio: { type: String }
    },
    
    // Education
    education: {
      tenthMarks: { type: Number, required: true },
      twelfthMarks: { type: Number, required: true }
    },
    
    // Placement
    placement: {
      placed: { type: Boolean, default: false },
      package: { type: Number },
      type: { type: String, enum: ["intern", "fte", "both"] },
      company: { type: String },
      offerDate: { type: Date }
    },
    
    // Account status
    accountStatus: { 
      type: String, 
      enum: ["active", "inactive", "blocked"],
      default: "active"
    }
  },
  { 
    timestamps: true 
  }
);

// Create and export the model
export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);