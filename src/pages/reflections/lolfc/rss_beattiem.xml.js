
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function get(context) {
 const blog = await getCollection('beattiem')
 return rss({
   title: 'Ежедневник Ал-анон',
   description: 'Ежедневник на каждый день',
   site: context.site,
   items: blog.map((post) => ({
     title: post.data.title,
     pubDate: post.data.pubDate,
     description: post.data.description,
     customData: post.data.customData,
     link: `/reflections/lolfc/${post.slug}/`,
   })),
   customData: `<language>ru</language>`,
 })
}
