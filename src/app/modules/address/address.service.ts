import { QueryBuilder } from "../../utils/QueryBuilder";
import { IAddress } from "./address.interface";
import { Address } from "./address.model";

const createAddress = async (payload: IAddress) => {
    // Check for unique ZIP constraint manually to provide a clear error message
    const existingZip = await Address.findOne({ zip: payload.zip });
    if (existingZip) {
        throw new Error(`An address with the ZIP code ${payload.zip} already exists.`);
    }

    const result = await Address.create(payload);
    return result;
};

const getAllAddresses = async (query: Record<string, string>) => {
    const searchableFields = ['street', 'city', 'zip', 'type'];
    const queryBuilder = new QueryBuilder(Address.find(), query)

    const contact = await queryBuilder
        .search(searchableFields)
        .filter()
        .sort()
        .fields()
        .paginate()

    const [data, meta] = await Promise.all([
        contact.build(),
        queryBuilder.getMeta()
    ])
    return {
        data,
        meta
    }
};

const getSingleAddress = async (id: string) => {
    const result = await Address.findById(id);
    if (!result) throw new Error("Address not found.");
    return result;
};

const updateAddress = async (id: string, payload: Partial<IAddress>) => {
    const existingAddress = await Address.findById(id);
    if (!existingAddress) {
        throw new Error("Address not found.");
    }

    // If they are trying to update the ZIP, make sure the new ZIP isn't already taken
    if (payload.zip && payload.zip !== existingAddress.zip) {
        const duplicateZip = await Address.findOne({ zip: payload.zip });
        if (duplicateZip) {
            throw new Error(`The ZIP code ${payload.zip} is already assigned to another address.`);
        }
    }

    const result = await Address.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    });

    return result;
};

const deleteAddress = async (id: string) => {
    const result = await Address.findByIdAndDelete(id);
    if (!result) throw new Error("Address not found.");
    return null;
};

export const AddressService = {
    createAddress,
    getAllAddresses,
    getSingleAddress,
    updateAddress,
    deleteAddress
};