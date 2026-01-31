import { Config } from '@react-router/dev/config'
import { pages } from 'src/lib/pages.server'
import { posts } from './src/lib/posts.server'
import { products } from 'src/lib/products.server'


const postSlugs = (await posts.getAllDetailed()).map(post => post.slug)
const productSlugs = products.getAll().map(product => product.slug)
const pageSlugs = pages.getAll().map(page => page.slug)

export default {
    ssr: false,
    prerender: ({ getStaticPaths }) => [
        ...getStaticPaths(),
        ...postSlugs.map(slug => `/blog/${slug}`),
        ...productSlugs.map(slug => `/product/${slug}`),
        ...pageSlugs.map(slug => `/${slug}`),
    ],
    appDirectory: 'src',
} satisfies Config
