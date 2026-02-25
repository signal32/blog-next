import { Config } from '@react-router/dev/config'
import { pages } from 'src/lib/pages.server'
import { products } from 'src/lib/products.server'
import { posts } from './src/lib/posts.server'

export default {
    ssr: false,
    prerender: async ({ getStaticPaths }) => {
        return [
            ...getStaticPaths(),
            ...(await posts.getAll()).flatMap(post => [
                `/blog/${post.slug}`,
                `/api/content/posts/${post.id}`
            ]),
            ...(await products.getAll()).flatMap(product => [
                `/product/${product.slug}`,
                `/api/content/products/${product.id}`
            ]),
            ...(await pages.getAll()).flatMap(page => [
                `/${page.slug}`,
                `/api/content/pages/${page.id}`
            ])
        ]
    },
    appDirectory: 'src',
} satisfies Config
