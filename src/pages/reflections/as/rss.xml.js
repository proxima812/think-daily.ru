import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'

export async function get(context) {
  const blog = await getCollection('as')
  return rss({
    title: 'АС: 90 дней размышления',
    description: 'Ежедневник на 90 дней',
    site: context.site,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      customData: post.data.customData,
      link: `/reflections/as/${post.slug}/`,
    })),
    customData: `<language>ru</language>`,
  })
}
