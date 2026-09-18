import { Config } from '@react-router/dev/config'
import { pages } from '#src/lib/pages.server'
import { products } from '#src/lib/products.server'
import { posts } from './src/lib/posts.server'

export default {
    ssr: false,
    appDirectory: 'src',
    prerender: async ({ getStaticPaths }) => {
        return [
            ...getStaticPaths(),
            ...await posts.prerenderPaths(),
            ...await products.prerenderPaths(),
            ...(await pages.getAllDetailed()).flatMap(page => [
                `/${page.slug}`,
                `/api/content/pages/${page.id}`
            ]),
        ]
    },
} satisfies Config
