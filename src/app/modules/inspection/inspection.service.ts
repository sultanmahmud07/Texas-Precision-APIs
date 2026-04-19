import { QueryBuilder } from "../../utils/QueryBuilder";
import { searchableFields } from "./inspection.constant";
import { IInspection } from "./inspection.interface";
import { Inspection } from "./inspection.model";

const createInspection = async (payload: IInspection) => {
    const result = await Inspection.create(payload);
    return result;
};

const getAllInspections = async (query: Record<string, string>) => {
  
    const queryBuilder = new QueryBuilder(Inspection.find(), query)
        .search(searchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        queryBuilder.build(),
        queryBuilder.getMeta()
    ]);

    return { data, meta };
};

const getSingleInspection = async (id: string) => {
    const result = await Inspection.findById(id);
    if (!result) throw new Error("Inspection record not found.");
    return result;
};

const updateInspection = async (id: string, payload: Partial<IInspection>) => {
    const result = await Inspection.findByIdAndUpdate(id, payload, { 
        new: true, 
        runValidators: true 
    });
    if (!result) throw new Error("Inspection record not found.");
    return result;
};

const deleteInspection = async (id: string) => {
    const result = await Inspection.findByIdAndDelete(id);
    if (!result) throw new Error("Inspection record not found.");
    return null;
};

export const InspectionService = {
    createInspection,
    getAllInspections,
    getSingleInspection,
    updateInspection,
    deleteInspection
};