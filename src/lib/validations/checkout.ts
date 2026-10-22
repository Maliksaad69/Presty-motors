import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  streetLine1: z.string().min(3, "Street address must be at least 3 characters").max(200),
  streetLine2: z.string().max(200).optional(),
  city: z.string().min(2, "City must be at least 2 characters").max(100),
  stateOrProvince: z.string().max(100).optional(),
  postalCode: z.string().min(2, "Postal code is required").max(20),
  country: z.string().min(2, "Country is required").max(100),
  phone: z.string().max(30).optional(),
});

export const createOrderItemSchema = z.object({
  id: z.string().min(1, "Item ID is required"),
  quantity: z.number().int().positive("Quantity must be at least 1").max(99),
});

export const createOrderSchema = z.object({
  customer: z.object({
    fullName: z.string().min(2, "Customer name is required").max(100),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(6, "Valid phone number is required").max(30),
  }),
  fulfillmentType: z.enum(["SHOWROOM_PICKUP", "DOMESTIC_DELIVERY", "INTERNATIONAL_QUOTE"]),
  shippingAddress: addressSchema.optional(),
  billingAddress: addressSchema.optional(),
  paymentMethod: z.enum(["CARD", "TRANSFER", "ON_PICKUP"]),
  items: z.array(createOrderItemSchema).min(1, "Order must contain at least one item"),
  promoCode: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateOrderSchemaType = z.infer<typeof createOrderSchema>;
