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
exports.AddressService = void 0;
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const address_model_1 = require("./address.model");
const createAddress = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check for unique ZIP constraint manually to provide a clear error message
    const existingZip = yield address_model_1.Address.findOne({ zip: payload.zip });
    if (existingZip) {
        throw new Error(`An address with the ZIP code ${payload.zip} already exists.`);
    }
    const result = yield address_model_1.Address.create(payload);
    return result;
});
const getAllAddresses = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const searchableFields = ['street', 'city', 'zip', 'type'];
    const queryBuilder = new QueryBuilder_1.QueryBuilder(address_model_1.Address.find(), query);
    const contact = yield queryBuilder
        .search(searchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        contact.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
const getSingleAddress = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield address_model_1.Address.findById(id);
    if (!result)
        throw new Error("Address not found.");
    return result;
});
const updateAddress = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingAddress = yield address_model_1.Address.findById(id);
    if (!existingAddress) {
        throw new Error("Address not found.");
    }
    // If they are trying to update the ZIP, make sure the new ZIP isn't already taken
    if (payload.zip && payload.zip !== existingAddress.zip) {
        const duplicateZip = yield address_model_1.Address.findOne({ zip: payload.zip });
        if (duplicateZip) {
            throw new Error(`The ZIP code ${payload.zip} is already assigned to another address.`);
        }
    }
    const result = yield address_model_1.Address.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    });
    return result;
});
const deleteAddress = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield address_model_1.Address.findByIdAndDelete(id);
    if (!result)
        throw new Error("Address not found.");
    return null;
});
exports.AddressService = {
    createAddress,
    getAllAddresses,
    getSingleAddress,
    updateAddress,
    deleteAddress
};
