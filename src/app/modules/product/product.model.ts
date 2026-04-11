import { model, Schema } from "mongoose";
import { IProduct, IProductVariation, ISpecification } from "./product.interface";

const productVariationSchema = new Schema<IProductVariation>({
  size: { type: String },
  color: { type: String },
  stock: { type: Number, required: true, default: 0 },
  price: { type: Number }, 
}, { _id: false });

const specificationSchema = new Schema<ISpecification>({
  name: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    bulletPoints: { type: [String], default: [] },
    description: { type: String }, // Stores your HTML string
    metaTitle: { type: String },
    metaDescription: { type: String },
    specifications: { type: [specificationSchema], default: [] },
    images: { type: [String], default: [] },
    deleteImages: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    isMenu: { type: Boolean, default: false },
    isTrendy: { type: Boolean, default: false },
    orderBy: { type: Number, default: 0 },
    featureImages: { type: [String], default: [] },
    basePrice: { type: Number, required: true },
    variations: [productVariationSchema],
    category: { type: Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true }
);

export const Product = model<IProduct>("Product", productSchema);