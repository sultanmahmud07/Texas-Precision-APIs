import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";
import { Review } from "../review/review.model";
import { Tour } from "../tour/tour.model";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isExist = await User.findOne({ email });
  if (isExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
  }

  const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND));
  const auth: IAuthProvider = { provider: "credentials", providerId: email as string };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [auth],
    ...rest
  });

  return user;
};

const updateUser = async (payload: Partial<IUser>, decodedToken: JwtPayload) => {
  const user = await User.findById(decodedToken.userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  if (payload.role) {
    if ([Role.TOURIST, Role.GUIDE].includes(decodedToken.role)) {
      throw new AppError(httpStatus.FORBIDDEN, "Insufficient role");
    }

    if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "Only super admin can assign super admin");
    }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if ([Role.TOURIST, Role.GUIDE].includes(decodedToken.role)) {
      throw new AppError(httpStatus.FORBIDDEN, "Insufficient role");
    }
  }

  if (payload.password) {
    payload.password = await bcryptjs.hash(payload.password, Number(envVars.BCRYPT_SALT_ROUND));
  }

  const updatedUser = await User.findByIdAndUpdate(decodedToken.userId, payload, {
    new: true,
    runValidators: true
  });

  return updatedUser;
};
const updateUserByAdmin = async (userId:string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

  if (payload.role) {
    if ([Role.TOURIST, Role.GUIDE].includes(decodedToken.role)) {
      throw new AppError(httpStatus.FORBIDDEN, "Insufficient role");
    }

    if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "Only super admin can assign super admin");
    }
  }

  if (payload.isActive || payload.isDeleted) {
    if ([Role.TOURIST, Role.GUIDE].includes(decodedToken.role)) {
      throw new AppError(httpStatus.FORBIDDEN, "Insufficient role");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true
  });

  return updatedUser;
};

const getAllUsers = async (query: Record<string, string>) => {

  const queryBuilder = new QueryBuilder(User.find({ isDeleted: false, role: "USER" }), query)

  const users = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate()

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta()
  ])
  return {
    data,
    meta
  }
};
const getAllAdmin = async (query: Record<string, string>) => {

  const queryBuilder = new QueryBuilder(User.find({ role: { $in: ["ADMIN", "SUPER_ADMIN"] } }), query)

  const users = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate()

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta()
  ])
  return {
    data,
    meta
  }
};
// Assuming User and Review models are imported

const getFeaturedGuide = async (query: Record<string, string>) => {

  // 1. Initial Find and Pagination (using existing QueryBuilder)
  const initialQuery = { role: "GUIDE" }; // Base query for guides

  const queryBuilder = new QueryBuilder(User.find(initialQuery), query);

  const usersQuery = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate(); // Paginate and filter before aggregation

  const [guides, meta] = await Promise.all([
    usersQuery.build(), // Execute the find query to get the guides
    queryBuilder.getMeta() // Get pagination metadata
  ]);

  // 2. Extract Guide IDs
  const guideIds = guides.map(guide => guide._id);

  // 3. Aggregate Review Data for the fetched Guides
  // Note: This requires the Review model to be imported.
  const reviewStats = await Review.aggregate([
    // Filter reviews only for the guides currently on the page
    { $match: { guide: { $in: guideIds } } },

    // Group by guide ID to calculate statistics
    {
      $group: {
        _id: "$guide", // Group by the guide ID in the Review document
        review_count: { $sum: 1 }, // Count the number of reviews
        avg_rating: { $avg: "$rating" }, // Calculate the average rating
      }
    },
    // Project to format the output (optional, but good practice)
    {
      $project: {
        _id: 0,
        guideId: "$_id",
        review_count: 1,
        avg_rating: { $round: ["$avg_rating", 2] } // Round to 2 decimal places
      }
    }
  ]);

  // 4. Merge Review Stats back into Guide Data
  const statsMap = new Map(reviewStats.map(stat => [stat.guideId.toString(), stat]));

  const dataWithStats = guides.map(guide => {
    const guideObj = guide.toObject ? guide.toObject() : guide; // Convert Mongoose document to plain object
    const stats = statsMap.get(guideObj._id.toString());

    return {
      ...guideObj,
      review_count: stats ? stats.review_count : 0,
      avg_rating: stats ? stats.avg_rating : 0.0, // Default to 0.0 if no reviews exist
    };
  });


  return {
    data: dataWithStats,
    meta
  };
};
const getFeaturedTourist = async (query: Record<string, string>) => {

  // 1. Initial Find and Pagination (using existing QueryBuilder)
  const initialQuery = { role: "TOURIST" }; // Base query for guides

  const queryBuilder = new QueryBuilder(User.find(initialQuery), query);

  const usersQuery = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate(); // Paginate and filter before aggregation

  const [guides, meta] = await Promise.all([
    usersQuery.build(), // Execute the find query to get the guides
    queryBuilder.getMeta() // Get pagination metadata
  ]);

  // 2. Extract Guide IDs
  const guideIds = guides.map(guide => guide._id);

  // 3. Aggregate Review Data for the fetched Guides
  // Note: This requires the Review model to be imported.
  const reviewStats = await Review.aggregate([
    // Filter reviews only for the guides currently on the page
    { $match: { user: { $in: guideIds } } },

    // Group by guide ID to calculate statistics
    {
      $group: {
        _id: "$user", // Group by the guide ID in the Review document
        review_count: { $sum: 1 }, // Count the number of reviews
        avg_rating: { $avg: "$rating" }, // Calculate the average rating
      }
    },
    // Project to format the output (optional, but good practice)
    {
      $project: {
        _id: 0,
        guideId: "$_id",
        review_count: 1,
        avg_rating: { $round: ["$avg_rating", 2] } // Round to 2 decimal places
      }
    }
  ]);

  // 4. Merge Review Stats back into Guide Data
  const statsMap = new Map(reviewStats.map(stat => [stat.guideId.toString(), stat]));

  const dataWithStats = guides.map(guide => {
    const guideObj = guide.toObject ? guide.toObject() : guide; // Convert Mongoose document to plain object
    const stats = statsMap.get(guideObj._id.toString());

    return {
      ...guideObj,
      review_count: stats ? stats.review_count : 0,
      avg_rating: stats ? stats.avg_rating : 0.0, // Default to 0.0 if no reviews exist
    };
  });


  return {
    data: dataWithStats,
    meta
  };
};
const getSearchGuide = async (query: Record<string, string>) => {

  // 1. Initial Find and Pagination (using existing QueryBuilder)
  const initialQuery = { role: "GUIDE" }; // Base query for guides

  const queryBuilder = new QueryBuilder(User.find(initialQuery), query);

  const usersQuery = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate(); // Paginate and filter before aggregation

  const [guides, meta] = await Promise.all([
    usersQuery.build(), // Execute the find query to get the guides
    queryBuilder.getMeta() // Get pagination metadata
  ]);

  // 2. Extract Guide IDs
  const guideIds = guides.map(guide => guide._id);

  // 3. Aggregate Review Data for the fetched Guides
  // Note: This requires the Review model to be imported.
  const reviewStats = await Review.aggregate([
    // Filter reviews only for the guides currently on the page
    { $match: { guide: { $in: guideIds } } },

    // Group by guide ID to calculate statistics
    {
      $group: {
        _id: "$guide", // Group by the guide ID in the Review document
        review_count: { $sum: 1 }, // Count the number of reviews
        avg_rating: { $avg: "$rating" }, // Calculate the average rating
      }
    },
    // Project to format the output (optional, but good practice)
    {
      $project: {
        _id: 0,
        guideId: "$_id",
        review_count: 1,
        avg_rating: { $round: ["$avg_rating", 2] } // Round to 2 decimal places
      }
    }
  ]);

  // 4. Merge Review Stats back into Guide Data
  const statsMap = new Map(reviewStats.map(stat => [stat.guideId.toString(), stat]));

  const dataWithStats = guides.map(guide => {
    const guideObj = guide.toObject ? guide.toObject() : guide; // Convert Mongoose document to plain object
    const stats = statsMap.get(guideObj._id.toString());

    return {
      ...guideObj,
      review_count: stats ? stats.review_count : 0,
      avg_rating: stats ? stats.avg_rating : 0.0, // Default to 0.0 if no reviews exist
    };
  });


  return {
    data: dataWithStats,
    meta
  };
};
const getAllDeletedUsers = async (query: Record<string, string>) => {

  const queryBuilder = new QueryBuilder(User.find({ isDeleted: true }), query)

  const users = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate()

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta()
  ])
  return {
    data,
    meta
  }
};
const getAllUnauthorizedUsers = async (query: Record<string, string>) => {

  const queryBuilder = new QueryBuilder(User.find({ isVerified: false }), query)

  const users = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate()

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta()
  ])
  return {
    data,
    meta
  }
};
const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");
  return {
    data: user
  }
};
const getGuideDetails = async (id: string) => {
  // 1. Fetch the Guide's basic profile
  const user = await User.findById(id).select("-password");

  if (!user || user.role !== 'GUIDE') {
    throw new AppError(httpStatus.NOT_FOUND, "Guide not found.");
  }
  // 2. Get Aggregated Review Statistics
  const reviewStats = await Review.aggregate([
    // Filter reviews only for this guide
    { $match: { guide: user._id } },

    // Group by guide ID to calculate statistics
    {
      $group: {
        _id: "$guide",
        review_count: { $sum: 1 },
        avg_rating: { $avg: "$rating" },
      }
    },
    // Project to format the output
    {
      $project: {
        _id: 0,
        review_count: 1,
        avg_rating: { $round: ["$avg_rating", 2] }
      }
    }
  ]);

  // Fetch all Tours authored by this Guide
  const guideTours = await Tour.find({ author: user._id }).lean(); // Use .lean() for easier modification

  // 3. Prepare Stats
  const stats = reviewStats[0] || { review_count: 0, avg_rating: 0.0 };

  // 4. Inject Stats into Each Tour's Author Field
  // We map over guideTours and inject the stats into the author field.
  const toursWithStats = guideTours.map(tour => {
    // Create a populated-like author object that includes the aggregated stats
    const authorWithStats = {
      ...user.toObject(), // Get the guide's basic profile data
      review_count: stats.review_count,
      avg_rating: stats.avg_rating,
    };

    return {
      ...tour, // The rest of the tour data
      author: authorWithStats, // Replace the simple author ID with the full object
    };
  });


  // 5. Merge Data for the Guide Profile
  const guideData = user.toObject(); // Convert Mongoose document to plain object

  return {
    data: {
      ...guideData,
      review_count: stats.review_count,
      avg_rating: stats.avg_rating,
      tours: toursWithStats, // Return the modified tours array
    }
  };
};
const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user
  }
};
const deleteUser = async (
  targetUserId: string,
  authUser: JwtPayload
) => {
  const user = await User.findById(targetUserId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Super-admin can delete anyone
  if (authUser.role === "SUPER_ADMIN" || authUser.role === "ADMIN") {
    await User.findByIdAndDelete(targetUserId);
    return { data: targetUserId };
  } else {
    throw new Error("Your are not authorized to delete this user.");
  }

};
export const UserServices = {
  createUser,
  getAllUsers,
  getAllAdmin,
  getAllDeletedUsers,
  getAllUnauthorizedUsers,
  updateUser,
  getMe,
  getSingleUser,
  getGuideDetails,
  getFeaturedTourist,
  getFeaturedGuide,
  getSearchGuide,
  deleteUser,
  updateUserByAdmin
}