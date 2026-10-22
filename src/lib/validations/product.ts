import { z } from "zod";

export const createProductSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must contain lowercase letters, numbers, and hyphens only"),
  sku: z.string().min(2).max(60).toUpperCase(),
  price: z.number().positive("Price must be greater than zero"),
  salePrice: z.number().positive().nullable().optional(),
  categoryId: z.string().min(1, "Category is required"),
  vehicleType: z.enum([
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
  imageUrl: z.string().url().or(z.string().startsWith("/")).nullable().optional(),
  translations: z
    .array(
      z.object({
        locale: z.string().min(2).max(5),
        title: z.string().min(2).max(200),
        shortDescription: z.string().max(500).optional(),
        description: z.string().min(5),
        specifications: z.any().optional(),
      })
    )
    .min(1, "At least one translation is required"),
});

export type CreateProductSchemaType = z.infer<typeof createProductSchema>;
