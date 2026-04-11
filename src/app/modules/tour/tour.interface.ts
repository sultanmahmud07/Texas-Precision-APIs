import { Types } from "mongoose";

export type Language = "English" | "Spanish" | "French" | "German" | "Other";
export type TourCategory = "Food" | "Art" | "Adventure" | "History" | "Nature" | "Other";
export type TourStatus = "PUBLIC" | "PRIVATE" | "HOLD" | "SUSPENDED";
export type TourTransportationMode = "Walking" | "Biking" | "Private Transport" | "Public Transport" | "Other";

export interface ITour {
  _id?: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  fee: number;
  durationHours: number;
  maxGroupSize: number;
  destinationCity: string;
  startTime?: string[];
  thumbnail?: string;       // single image
  images?: string[];        // multiple images
  deleteImages?: string[];        // multiple images to delete
  childFee?: number;
  meetingPoint?: string;
  transportationMode?: TourTransportationMode;
  itinerary?: string[];
  importantPoints?: string[];        
  cancellationPolicy?: string[];   
  inclusionsAndExclusions?: {
    inclusions: string[];
    exclusions: string[];
  };   
  author: Types.ObjectId;
  reviews?: Types.ObjectId;
  language?: Language;
  category: TourCategory;
  isActive: boolean;
  status: TourStatus;

}
