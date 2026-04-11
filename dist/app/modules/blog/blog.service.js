"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
const cloudinary_config_1 = require("../../config/cloudinary.config");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const blog_constant_1 = require("./blog.constant");
const blog_model_1 = require("./blog.model");
const createBlog = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingBlog = yield blog_model_1.Blog.findOne({ slug: payload.slug });
    if (existingBlog) {
        throw new Error("A Blog with this slug already exists.");
    }
    const blog = yield blog_model_1.Blog.create(payload);
    return blog;
});
const getAllBlog = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(blog_model_1.Blog.find(), query);
    const blogs = yield queryBuilder
        .search(blog_constant_1.blogSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        blogs.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
const getSingleBlog = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const blog = yield blog_model_1.Blog.findOne({ slug });
    // .populate("category")
    // .populate("author", "name email");
    if (blog) {
        blog.views = (blog.views || 0) + 1; // ✅ Auto increment views
        yield blog.save();
    }
    return {
        data: blog,
    };
});
const updateBlog = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingBlog = yield blog_model_1.Blog.findById(id);
    if (!existingBlog) {
        throw new Error("Blog not found.");
    }
    const duplicateBlog = yield blog_model_1.Blog.findOne({
        name: payload.slug,
        _id: { $ne: id },
    });
    if (duplicateBlog) {
        throw new Error("A blog with this slug already exists.");
    }
    const updatedBlog = yield blog_model_1.Blog.findByIdAndUpdate(id, payload, { new: true });
    if (payload.thumbnail && existingBlog.thumbnail) {
        yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(existingBlog.thumbnail);
    }
    return updatedBlog;
});
const deleteBlog = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingBlog = yield blog_model_1.Blog.findById(id);
    if (!existingBlog) {
        throw new Error("Blog not found.");
    }
    if (existingBlog.thumbnail) {
        yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(existingBlog.thumbnail);
    }
    // await Comment.deleteMany({ blog: id }); // ✅ Delete related comments
    yield blog_model_1.Blog.findByIdAndDelete(id);
    return null;
});
exports.BlogService = {
    createBlog,
    getSingleBlog,
    getAllBlog,
    updateBlog,
    deleteBlog,
};
