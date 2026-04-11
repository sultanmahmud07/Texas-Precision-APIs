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
exports.CategoryService = void 0;
const cloudinary_config_1 = require("../../config/cloudinary.config");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const category_constant_1 = require("./category.constant");
const category_model_1 = require("./category.model");
const createCategory = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingCategory = yield category_model_1.Category.findOne({ name: payload.slug });
    if (existingCategory) {
        throw new Error("A category with this slug already exists.");
    }
    const category = yield category_model_1.Category.create(payload);
    return category;
});
const getAllCategory = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(category_model_1.Category.find(), query);
    const categoriesData = queryBuilder
        .search(category_constant_1.categorySearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        categoriesData.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
const getSingleCategory = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_model_1.Category.findOne({ slug });
    return {
        data: category,
    };
});
const updateCategory = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingCategory = yield category_model_1.Category.findById(id);
    if (!existingCategory) {
        throw new Error("Category not found.");
    }
    const duplicateCategory = yield category_model_1.Category.findOne({
        name: payload.name,
        _id: { $ne: id },
    });
    if (duplicateCategory) {
        throw new Error("A category with this name already exists.");
    }
    const updatedDivision = yield category_model_1.Category.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (payload.thumbnail && existingCategory.thumbnail) {
        yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(existingCategory.thumbnail);
    }
    return updatedDivision;
});
const deleteCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingCategory = yield category_model_1.Category.findById(id);
    if (!existingCategory) {
        throw new Error("Category not found.");
    }
    if (existingCategory.thumbnail) {
        yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(existingCategory.thumbnail);
    }
    yield category_model_1.Category.findByIdAndDelete(id);
    return null;
});
exports.CategoryService = {
    createCategory,
    getAllCategory,
    getSingleCategory,
    updateCategory,
    deleteCategory,
};
