import { z } from "zod";

export const localImageSchema = z.object({
  data: z.string().min(1, "Image binary/base64 data is required"),
  mimeType: z.string().default("image/jpeg"),
  altText: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export const createProductSchema = z.object({
  slug: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  price: z.number().positive("Price must be greater than zero"),
  salePrice: z.number().positive().nullable().optional(),
  categoryId: z.string().min(1, "Category is required"),
  vehicleType: z.enum([
    "CAR",
    "MOTORCYCLE_KIDS",
    "MOTORCYCLE_ADULT",
    "QUAD",
    "EQUIPMENT",
    "PARTS",
    "OTHER",
  ]),
  ageGroup: z.string().max(50).nullable().optional(),
  engineCapacity: z.string().max(50).nullable().optional(),
  initialStock: z.number().int().min(0, "Stock cannot be negative"),
  imageUrl: z.string().nullable().optional(),
  images: z.array(localImageSchema).optional(),
  translations: z
    .array(
      z.object({
        locale: z.string().min(2).max(5),
        title: z.string().min(2).max(200),
        shortDescription: z.string().max(500).optional(),
        description: z.string().min(1),
        specifications: z.any().optional(),
      })
    )
    .min(1, "At least one translation is required"),
});

export type LocalImageSchemaType = z.infer<typeof localImageSchema>;
export type CreateProductSchemaType = z.infer<typeof createProductSchema>;
