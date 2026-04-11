import { Types } from "mongoose";

export interface IProductVariation {
  size?: string;   
  color?: string;  // You will use this for "Matte Black / Silver"
  stock: number;   
  price?: number;   
}

export interface ISpecification {
  name: string;    // e.g., "Sensor Type"
  value: string;   // e.g., "CMOS"
}

export interface IProduct {
  name: string;
  slug: string;
  bulletPoints?: string[];      // The short list next to the camera
  description?: string;    
  metaTitle?: string;
  metaDescription?: string;
  specifications?: ISpecification[]; // Table data
  images?: string[];            // Main gallery images
  featureImages?: string[];     // Images specifically for the Features tab
  basePrice: number; 
  variations: IProductVariation[];
  category?: Types.ObjectId;
  deleteImages?: string[];
  isFeatured?: boolean;
  isMenu?: boolean;
  isTrendy?: boolean;
  orderBy?: number;
  createdAt: Date;
  updatedAt: Date;
}