import { Config } from '@react-router/dev/config'
import { pages } from 'src/lib/pages.server'
import { products } from 'src/lib/products.server'
import { posts } from './src/lib/posts.server'

export default {
    ssr: false,
    prerender: async ({ getStaticPaths }) => {
        const postSlugs = (await posts.getAllDetailed()).map(post => post.slug)
        const productSlugs = (await products.getAll()).map(product => product.slug)
        const pageSlugs = (await pages.getAll()).map(page => page.slug)

        return [
            ...getStaticPaths(),
            ...postSlugs.map(slug => `/blog/${slug}`),
            ...productSlugs.map(slug => `/product/${slug}`),
            ...pageSlugs.map(slug => `/${slug}`),
        ]
    },
    appDirectory: 'src',
} satisfies Config
