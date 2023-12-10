import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function get(context) {
 const blog = await getCollection('alanon')
 return rss({
   title: 'День за днем в Ал-Анон',
   description: 'Ежедневник на каждый день',
   site: context.site,
   items: blog.map((post) => ({
     title: post.data.title,
     pubDate: post.data.pubDate,
     description: post.data.description,
     customData: post.data.customData,
     link: `/reflections/alanon/${post.slug}/`,
   })),
   customData: `<language>ru</language>`,
 })
}
