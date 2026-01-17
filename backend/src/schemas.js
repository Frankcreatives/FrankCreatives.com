const { z } = require('zod');

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(['idea', 'in-progress', 'beta', 'released']),
  github_link: z.string().url("Invalid GitHub URL").optional().or(z.literal('')),
  demo_link: z.string().url("Invalid Demo URL").optional().or(z.literal('')),
  image_url: z.string().url("Invalid Image URL").optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  version: z.string().optional()
});

const feedbackSchema = z.object({
  project_id: z.string().uuid("Invalid Project ID"),
  rating: z.number().int().min(1).max(5),
  category: z.enum(['bug', 'ux', 'feature', 'general']),
  message: z.string().min(1, "Message is required")
});

const newsletterSchema = z.object({
  email: z.string().email("Invalid email address")
});

module.exports = {
  projectSchema,
  feedbackSchema,
  newsletterSchema
};
