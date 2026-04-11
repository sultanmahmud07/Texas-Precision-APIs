import { QueryBuilder } from "../../utils/QueryBuilder";
import { contactSearchableFields } from "./contact.constant";
import { Contact } from "./contact.model";
import { IContact } from "./contact.interface";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";

const createContact = async (data: Partial<IContact>) => {
  
const contact = await Contact.create(data);
  return contact;
};

const getContact = async (query: Record<string, string>) => {

   const queryBuilder = new QueryBuilder(Contact.find(), query)

  const contact = await queryBuilder
    .search(contactSearchableFields)
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
const getSingleContact = async (id: string) => {
    const contact = await Contact.findById({_id: id})
    // .populate("products");
    .populate({
        path: "products",
        select: "name slug images basePrice" // Only fetch these specific fields
    });
    return {
        data: contact,
    }
};

const deleteContact = async (contactId: string,) => {
  const contact = await Contact.findById(contactId);
  if (!contact) {
    throw new AppError(httpStatus.NOT_FOUND, "Contact info not found");
  }
    await Contact.findByIdAndDelete(contactId);
    return { data: contactId };
  
};


export const ContactService = {
  createContact,
  getContact,
  getSingleContact,
  deleteContact
};
