/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tour } from "./tour.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ITour } from "./tour.interface";
import { tourSearchableFields } from "./tour.constant";
import { Review } from "../review/review.model";
import mongoose from "mongoose";

const createTour = async (data: Partial<ITour>) => {
  const exists = await Tour.findOne({ slug: data.slug });
  if (exists) {
    throw new AppError(
      httpStatus.CONFLICT,
      "A tour with this slug already exists"
    );
  }

  const tour = await Tour.create(data);
  return { data: tour };
};

const updateTour = async (id: string, payload: Partial<ITour>) => {
  const existingTour = await Tour.findById(id);

  if (!existingTour) {
    throw new AppError(httpStatus.NOT_FOUND, "Tour not found.");
  }

  // If slug is being changed, ensure uniqueness
  if (payload.slug && payload.slug !== existingTour.slug) {
    const slugExists = await Tour.findOne({ slug: payload.slug, _id: { $ne: id } });
    if (slugExists) {
      throw new AppError(httpStatus.CONFLICT, "Another tour already uses this slug");
    }
  }


  if (payload.images && payload.images.length > 0 && existingTour.images && existingTour.images.length > 0) {
    payload.images = [...payload.images, ...existingTour.images]
  }

  if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {

    const restDBImages = existingTour.images.filter(imageUrl => !payload.deleteImages?.includes(imageUrl))

    const updatedPayloadImages = (payload.images || [])
      .filter(imageUrl => !payload.deleteImages?.includes(imageUrl))
      .filter(imageUrl => !restDBImages.includes(imageUrl))

    payload.images = [...restDBImages, ...updatedPayloadImages]


  }

  // Update doc
  const updatedTour = await Tour.findByIdAndUpdate(id, payload, { new: true });
  if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {
    await Promise.all(payload.deleteImages.map(url => deleteImageFromCLoudinary(url)))
  }
  return { data: updatedTour };
};
// const getAllTours = async (query: Record<string, string>) => {
//   const queryBuilder = new QueryBuilder(Tour.find().populate("author"), query);

//   const tours = await queryBuilder
//     .search(tourSearchableFields)
//     .filter()
//     .sort()
//     .fields()
//     .paginate();

//   const [data, meta] = await Promise.all([tours.build(), queryBuilder.getMeta()]);

//   return {
//     data,
//     meta
//   };
// };
// Assuming Tour, User, and Review models are imported

const getAllTours = async (query: Record<string, string>) => {

  const queryBuilder = new QueryBuilder(Tour.find().populate("author"), query);

  const toursQuery = await queryBuilder
    .search(tourSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [tours, meta] = await Promise.all([toursQuery.build(), queryBuilder.getMeta()]);

  // 2. Extract unique Author IDs from the fetched tours
  const authorIds = [
    ...new Set(
      tours
        .map(tour => (tour.author as any)?._id?.toString())
        .filter(id => id) // Filter out null/undefined/unpopulated authors
    )
  ];

  // If no tours or no authors found, return early
  if (authorIds.length === 0) {
    return { data: tours, meta };
  }

  // 3. Aggregate Review Data for the fetched Authors
  // Note: This requires the Review model to be imported.
  const reviewStats = await Review.aggregate([
    // Filter reviews only for the authors currently present in the tours
    { $match: { guide: { $in: authorIds.map(id => new mongoose.Types.ObjectId(id)) } } },

    // Group by guide ID to calculate statistics
    {
      $group: {
        _id: "$guide", // Group by the guide ID in the Review document
        review_count: { $sum: 1 }, // Count the number of reviews
        avg_rating: { $avg: "$rating" }, // Calculate the average rating
      }
    },
    // Project to format the output
    {
      $project: {
        _id: 0,
        guideId: "$_id",
        review_count: 1,
        avg_rating: { $round: ["$avg_rating", 2] } // Round to 2 decimal places
      }
    }
  ]);

  // 4. Merge Review Stats back into Author Data within the Tour object
  const statsMap = new Map(reviewStats.map(stat => [stat.guideId.toString(), stat]));

  const dataWithStats = tours.map(tour => {
    const tourObj = tour.toObject ? tour.toObject() : tour; // Convert Mongoose document to plain object
    const author = tourObj.author;

    if (author && author._id) {
      const stats = statsMap.get(author._id.toString());

      // Merge stats into the author object
      tourObj.author = {
        ...author,
        review_count: stats ? stats.review_count : 0,
        avg_rating: stats ? stats.avg_rating : 0.0,
      } as any;
    }

    return tourObj;
  });


  return {
    data: dataWithStats,
    meta
  };
};

const getSearchTours = async (query: Record<string, string>) => {

  // --- 1. Pagination and Sorting Initialization ---
  const page = Math.max(1, Number(query?.page || query.p || 1));
  const limit = Math.max(1, Number(query?.limit || query.size || 10));
  const skip = (page - 1) * limit;

  // Sorting
  let sortObj: any = { createdAt: -1 };
  if (query.sort) {
    const s = String(query.sort).trim();
    if (s.startsWith("-")) sortObj = { [s.slice(1)]: -1 };
    else if (s.startsWith("+")) sortObj = { [s.slice(1)]: 1 };
    else sortObj = { [s]: 1 };
  } else if (query.sortBy) {
    const order = (query.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;
    sortObj = { [query.sortBy]: order };
  }

  // Fields projection (optional)
  let projection: any = null;
  if (query.fields) {
    const fields = String(query.fields)
      .split(",")
      .map(f => f.trim())
      .filter(Boolean);
    if (fields.length) {
      projection = fields.join(" ");
    }
  }

  // --- 2. Build Mongoose Filters (The 'where' clause) ---
  const filters: any = {};

  // SEARCH: split terms and require each term to match at least one searchable field
  if (query.search) {
    const raw = String(query.search).trim();
    if (raw.length > 0) {
      const terms = raw.split(/\s+/).map(t => t.trim()).filter(Boolean);

      filters.$and = terms.map(term => {
        const ors = tourSearchableFields.map(field => {
          const obj: any = {};
          // Case-insensitive regex for partial match
          obj[field] = { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
          return obj;
        });
        return { $or: ors };
      });
    }
  }

  // PRICE RANGE: expects "min-max" or single "min"
  if (query.priceRange || query.price) {
    const range = String(query.priceRange || query.price).trim();
    if (range) {
      const [minRaw, maxRaw] = range.split("-").map(s => s.trim());
      const priceFilter: any = {};
      if (minRaw !== "" && !Number.isNaN(Number(minRaw))) priceFilter.$gte = Number(minRaw);
      if (maxRaw !== undefined && maxRaw !== "" && !Number.isNaN(Number(maxRaw))) priceFilter.$lte = Number(maxRaw);

      // if "50" provided without dash, treat as min
      if (!range.includes("-") && !Number.isNaN(Number(range))) {
        priceFilter.$gte = Number(range);
      }

      if (Object.keys(priceFilter).length > 0) {
        filters.fee = priceFilter;
      }
    }
  }

  // CATEGORY: Case-insensitive, flexible match (Corrected)
  if (query.category) {
    const categoryValue = String(query.category).trim();
    if (categoryValue) {
      // If category is a string field, use regex for case-insensitive partial match
      filters.category = { $regex: categoryValue, $options: "i" };
    }
  }

  // LANGUAGE: Case-insensitive, flexible match (Corrected)
  if (query.language) {
    const languageValue = String(query.language).trim();
    if (languageValue) {
      // Assuming tour.language is a string field like "English" or the primary language
      filters.language = { $regex: languageValue, $options: "i" };

      // NOTE: If you wanted to search the Guide's languages (which is an array), 
      // you would need to use aggregation here, but since this is Tour.find(),
      // we assume we are searching the Tour's language field.
    }
  }

  // status/isActive filter
  if (query.status) {
    filters.status = String(query.status).trim();
  }
  if (query.isActive) {
    filters.isActive = String(query.isActive).toLowerCase() === "true";
  }

  // --- 3. Execute Query and Count ---

  // Build initial query
  const baseQuery = Tour.find(filters);

  if (projection) baseQuery.select(projection);

  // populate author so we can merge review stats later
  baseQuery.populate("author");

  // apply sort, skip, limit
  baseQuery.sort(sortObj).skip(skip).limit(limit);

  // execute results and count in parallel
  const [docs, total] = await Promise.all([
    baseQuery.exec(),
    Tour.countDocuments(filters).exec() // Count total documents matching filters
  ]);

  // --- 4. Prepare Meta Data ---
  const totalPages = Math.ceil(total / limit) || 1;
  const meta = {
    total,
    page,
    limit,
    totalPages
  };

  // If no docs, return early
  if (!docs || docs.length === 0) {
    return {
      data: [],
      meta
    };
  }

  // --- 5. Aggregate Review Stats for Authors ---

  // Extract unique Author IDs from the fetched tours
  const authorIds = [
    ...new Set(
      docs
        .map((d: any) => (d.author && d.author._id ? d.author._id.toString() : null))
        .filter(Boolean)
    )
  ];

  let statsMap = new Map<string, { review_count: number; avg_rating: number }>();
  if (authorIds.length > 0) {
    // Aggregation pipeline to calculate stats
    const agg = await Review.aggregate([
      // Match reviews for authors on the current page
      { $match: { guide: { $in: authorIds.map(id => new mongoose.Types.ObjectId(id)) } } },
      {
        $group: {
          _id: "$guide",
          review_count: { $sum: 1 },
          avg_rating: { $avg: "$rating" }
        }
      },
      {
        $project: {
          guideId: "$_id",
          review_count: 1,
          avg_rating: { $round: ["$avg_rating", 2] }
        }
      }
    ]).exec();

    statsMap = new Map(agg.map((s: any) => [s.guideId.toString(), { review_count: s.review_count, avg_rating: s.avg_rating }]));
  }

  // --- 6. Merge Review Stats into each Tour's Author Object ---

  const dataWithStats = docs.map((doc: any) => {
    // Use .toObject() or spread to convert Mongoose document to a plain object for modification
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    const author = obj.author;

    if (author && author._id) {
      const stat = statsMap.get(author._id.toString());

      // Inject review stats into the author object
      obj.author = {
        ...author,
        review_count: stat ? stat.review_count : 0,
        avg_rating: stat ? stat.avg_rating : 0
      };
    }
    return obj;
  });

  // --- 7. Return Final Data and Meta ---
  return {
    data: dataWithStats,
    meta
  };
};

const getSingleTour = async (slug: string) => {
  // 1. Fetch the Tour and populate basic Author details
  const tourQuery = Tour.findOne({ slug }).populate({
    path: 'author',
    select: 'name email picture bio address guideProfile' // Added guideProfile in case stats are there
  });

  // 2. Execute the query
  const tour = await tourQuery.lean(); // .lean() for better performance if just reading

  if (!tour) {
    throw new AppError(httpStatus.NOT_FOUND, "Tour not found with this slug.");
  }

  // 3. Parallel Fetch: Get Reviews for this Tour AND Author Stats
  const [reviews, authorStats] = await Promise.all([
    // A. Get all reviews for this specific tour
    Review.find({ tour: tour._id })
      .populate("user", "name picture bio email") // Populate reviewer details
      .sort({ createdAt: -1 }),         // Newest reviews first

    // B. Calculate Author's Avg Rating & Review Count (Aggregation)
    Review.aggregate([
      { $match: { guide: new mongoose.Types.ObjectId(tour.author._id) } },
      {
        $group: {
          _id: "$guide",
          avg_rating: { $avg: "$rating" },
          review_count: { $sum: 1 }
        }
      }
    ])
  ]);

  // 4. Merge Author Stats into the Author object
  const stats = authorStats[0] || { avg_rating: 0, review_count: 0 };

  const tourWithAuthorStats = {
    ...tour,
    author: {
      ...tour.author,
      avg_rating: parseFloat(stats.avg_rating.toFixed(2)), // Round to 2 decimal places
      review_count: stats.review_count
    }
  };

  return {
    data: tourWithAuthorStats,
    reviews: reviews // Return reviews separately or attach to tour object if preferred
  };
};

const getToursByGuide = async (guideId: string, query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Tour.find({ author: guideId }), query);

  const tours = await queryBuilder
    .search(tourSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([tours.build(), queryBuilder.getMeta()]);

  return { data, meta };
};
const deleteTour = async (id: string) => {
  const existingTour = await Tour.findById(id);
  if (!existingTour) {
    throw new AppError(httpStatus.NOT_FOUND, "Tour not found.");
  }

  // Delete all images (thumbnail + images) from cloudinary if present
  const toDelete: string[] = [];
  if (existingTour.thumbnail) toDelete.push(existingTour.thumbnail);
  if (Array.isArray(existingTour.images) && existingTour.images.length > 0) {
    toDelete.push(...existingTour.images);
  }

  // Delete DB record
  const deleted = await Tour.findByIdAndDelete(id);

  // Attempt cloudinary deletes (best-effort)
  if (toDelete.length > 0) {
    await Promise.all(
      toDelete.map(async (url) => await deleteImageFromCLoudinary(url)
      ));
  }

  return deleted;
};

export const TourService = {
  createTour,
  getAllTours,
  getSingleTour,
  updateTour,
  deleteTour,
  getToursByGuide,
  getSearchTours
};