import { Config } from '@react-router/dev/config'
import { pages } from 'src/lib/pages'
import { posts } from 'src/lib/posts'
import { products } from 'src/lib/products'

const postSlugs = posts.getAll().map(post => post.slug)
const productSlugs = products.getAll().map(product => product.slug)
const pageSlugs = pages.getAll().map(page => page.slug)

export default {
    // Config options...
    // Server-side render by default, to enable SPA mode set this to `false`
    ssr: true,
    prerender: ({ getStaticPaths }) => [
        ...getStaticPaths(),
        ...postSlugs.map(slug => `/blog/${slug}`),
        ...productSlugs.map(slug => `/product/${slug}`),
        ...pageSlugs.map(slug => `/page/${slug}`),
    ],
    appDirectory: 'src',
} satisfies Config
