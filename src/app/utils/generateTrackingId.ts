export const generateTrackingId = (): string => {
  const timestamp = Date.now().toString(36); // convert timestamp to base36
  const random = Math.random().toString(36).substring(2, 8).toUpperCase(); // random string
  return `TRK-${timestamp}-${random}`;
};
