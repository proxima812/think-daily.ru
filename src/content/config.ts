import { defineCollection, z } from 'astro:content'

const aa24hours = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    desc: z.string(),
    pubDate: z.date(),
    moth: z.string().optional(),
  }),
})

const lolfc = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    desc: z.string(),
    pubDate: z.date(),
    moth: z.string().optional(),
  }),
})
const an = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    desc: z.string(),
    pubDate: z.date(),
    moth: z.string().optional(),
  }),
})
const aadays = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    desc: z.string(),
    pubDate: z.date(),
    moth: z.string().optional(),
  }),
})
const aa = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    desc: z.string(),
    pubDate: z.date(),
    moth: z.string().optional(),
  }),
})
const alanon = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    desc: z.string(),
    pubDate: z.date(),
    moth: z.string().optional(),
  }),
})
const alanonmm = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    desc: z.string(),
    pubDate: z.date(),
    moth: z.string().optional(),
  }),
})
const slt = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    desc: z.string(),
    pubDate: z.date(),
  }),
})
const as = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    desc: z.string().optional(),
  }),
})

export const collections = {
  aa,
  as,
  an,
  slt,
  aa24hours,
  lolfc,
  aadays,
  alanon,
  alanonmm,
}
