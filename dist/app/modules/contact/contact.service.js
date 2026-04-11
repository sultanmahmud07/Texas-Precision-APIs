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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const contact_constant_1 = require("./contact.constant");
const contact_model_1 = require("./contact.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const createContact = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const contact = yield contact_model_1.Contact.create(data);
    return contact;
});
const getContact = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(contact_model_1.Contact.find(), query);
    const contact = yield queryBuilder
        .search(contact_constant_1.contactSearchableFields)
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
const deleteContact = (contactId) => __awaiter(void 0, void 0, void 0, function* () {
    const contact = yield contact_model_1.Contact.findById(contactId);
    if (!contact) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Contact info not found");
    }
    yield contact_model_1.Contact.findByIdAndDelete(contactId);
    return { data: contactId };
});
exports.ContactService = {
    createContact,
    getContact,
    deleteContact
};
