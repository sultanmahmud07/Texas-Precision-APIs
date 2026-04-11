
export interface IMessageRequest {
  tourDate: string;            // YYYY-MM-DD
  meetingTime: string;         // morning | afternoon | evening | custom
  guests: string;              // "1-2", "3-5 People", etc.
  hotelAccommodation?: string; 
  interestedTour: string;      // personalized | shared | private | etc.
  message: string;             
  guide: string;               // Guide ObjectId
  area?: string;               
  user?: string;               // Tourist making the request
}
