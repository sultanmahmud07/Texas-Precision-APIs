import { Types } from "mongoose";

export type TInquiryType = "PRODUCT" | "GENERAL";

export interface IContact {
  name: string;      
  email: string;
  phone?: string;    
  message: string;
  inquiryType: TInquiryType; 
  products?: Types.ObjectId[]; 
  createdAt?: Date;
  updatedAt?: Date;
}