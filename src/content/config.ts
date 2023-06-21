import { defineCollection, z } from "astro:content";
export const collections = {
 aa24hours: defineCollection({
  schema: z.object({
   id: z.string(),
   title: z.string(),
   desc: z.string(),
   pubDate: z.date(),
   moth: z.string().optional(),
  }),
 }),
 beattiem: defineCollection({
  schema: z.object({
   id: z.string(),
   title: z.string(),
   desc: z.string(),
   pubDate: z.date(),
   moth: z.string().optional(),
  }),
 }),
 an: defineCollection({
  schema: z.object({
   id: z.string(),
   title: z.string(),
   desc: z.string(),
   pubDate: z.date(),
   moth: z.string().optional(),
  }),
 }),
 aadays: defineCollection({
  schema: z.object({
   id: z.string(),
   title: z.string(),
   desc: z.string(),
   pubDate: z.date(),
   moth: z.string().optional(),
  }),
 }),
 aa: defineCollection({
  schema: z.object({
   id: z.string(),
   title: z.string(),
   desc: z.string(),
   pubDate: z.date(),
   moth: z.string().optional(),
  }),
 }),
 alanon: defineCollection({
  schema: z.object({
   id: z.string(),
   title: z.string(),
   desc: z.string(),
   pubDate: z.date(),
   moth: z.string().optional(),
  }),
 }),
 alanonmm: defineCollection({
  schema: z.object({
   id: z.string(),
   title: z.string(),
   desc: z.string(),
   pubDate: z.date(),
   moth: z.string().optional(),
  }),
 }),
 slt: defineCollection({
  schema: z.object({
   id: z.string(),
   title: z.string(),
   desc: z.string(),
   pubDate: z.date(),
  }),
 }),
};
