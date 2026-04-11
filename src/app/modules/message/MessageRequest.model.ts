import mongoose, { Schema, Document } from "mongoose";

export interface IMessageRequestDoc extends Document {
  tourDate: string;
  meetingTime: string;
  guests: string;
  hotelAccommodation?: string;
  interestedTour: string;
  message: string;
  guide: mongoose.Types.ObjectId;
  area?: string;
  user: mongoose.Types.ObjectId;
}

const MessageRequestSchema = new Schema<IMessageRequestDoc>(
  {
    tourDate: { type: String, required: true },
    meetingTime: { type: String, required: true },
    guests: { type: String, required: true },
    hotelAccommodation: { type: String },
    interestedTour: { type: String, required: true },
    message: { type: String, required: true },
    guide: { type: Schema.Types.ObjectId, ref: "User", required: true },
    area: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const MessageRequest = mongoose.model("MessageRequest", MessageRequestSchema);
