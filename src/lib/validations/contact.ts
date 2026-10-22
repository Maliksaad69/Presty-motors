import { z } from "zod";

export const contactFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().min(6, "Please provide a valid telephone number").max(30),
  subject: z.string().min(2, "Subject is required").max(150),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters long")
    .max(2000, "Message cannot exceed 2000 characters"),
});

export type ContactFormSchemaType = z.infer<typeof contactFormSchema>;
