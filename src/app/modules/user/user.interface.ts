import { Types } from "mongoose";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  GUIDE = "GUIDE",
  USER = "USER",
  TOURIST = "TOURIST"
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED"
}

export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

export interface IGuideProfile {
  expertise?: string[];       // e.g. ["History", "Food"]
  dailyRate?: number;         // price per booking/day
  languages?: string[];       // urls
}

export interface ITouristProfile {
  preferences?: string[];     // travel interests
  state?: string;
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  picture?: string;
  ava_rating?: string;
  review_count?: string;
  bio?: string;
  state?: string;
  address?: string;
  languages?: string[];
  isDeleted?: boolean;
  isActive?: IsActive;
  isVerified?: boolean;         // email verified
  isFeatured?: boolean;         // email verified
  role: Role;
  auths: IAuthProvider[];
  reviews?: Types.ObjectId,
  guideProfile?: IGuideProfile;
  touristProfile?: ITouristProfile;
  createdAt?: Date;
  updatedAt?: Date;
}
