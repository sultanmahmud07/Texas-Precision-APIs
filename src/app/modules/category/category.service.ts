import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { categorySearchableFields } from "./category.constant";
import { ICategory } from "./category.interface";
import { Category } from "./category.model";

const createCategory = async (payload: ICategory) => {
    const existingCategory = await Category.findOne({ name: payload.slug });
    if (existingCategory) {
        throw new Error("A category with this slug already exists.");
    }

    const category = await Category.create(payload);

    return category
};

const getAllCategory = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(Category.find(), query)

    const categoriesData = queryBuilder
        .search(categorySearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate()

    const [data, meta] = await Promise.all([
        categoriesData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};
const getSingleCategory = async (slug: string) => {
    const category = await Category.findOne({ slug });
    return {
        data: category,
    }
};



const updateCategory = async (id: string, payload: Partial<ICategory>) => {

    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
        throw new Error("Category not found.");
    }

    const duplicateCategory = await Category.findOne({
        name: payload.name,
        _id: { $ne: id },
    });

    if (duplicateCategory) {
        throw new Error("A category with this name already exists.");
    }

    const updatedDivision = await Category.findByIdAndUpdate(id, payload, { new: true, runValidators: true })

    if (payload.thumbnail && existingCategory.thumbnail) {
        await deleteImageFromCLoudinary(existingCategory.thumbnail)
    }

    return updatedDivision

};

const deleteCategory = async (id: string) => {
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
        throw new Error("Category not found.");
    }
    if (existingCategory.thumbnail) {
        await deleteImageFromCLoudinary(existingCategory.thumbnail)
    }
    await Category.findByIdAndDelete(id);
    return null;
};

export const CategoryService = {
    createCategory,
    getAllCategory,
    getSingleCategory,
    updateCategory,
    deleteCategory,
};
