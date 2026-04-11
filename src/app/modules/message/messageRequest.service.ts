
import { IMessageRequest } from "./messageRequest.interface";
import { MessageRequest } from "./MessageRequest.model";

const createMessageRequest = async (payload: Partial<IMessageRequest>) => {
  const request = await MessageRequest.create({
    payload
  });

  return { data: request };
};

const getGuideRequests = async (guideId: string) => {
  const requests = await MessageRequest.find({ guide: guideId })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return { data: requests };
};

export const MessageRequestService = {
  createMessageRequest,
  getGuideRequests,
};
