import { contentRouting } from '#src/lib/allContent.server.ts'
import { pages } from '#src/lib/pages.server'
import { productRouting } from '#src/lib/products.server'
import { Config } from '@react-router/dev/config'
import { postRouting } from './src/lib/posts.server'

export default {
    ssr: false,
    appDirectory: 'src',
    prerender: async ({ getStaticPaths }) => {
        return [
            ...getStaticPaths(),
            ...await postRouting.prerenderPaths(),
            ...await productRouting.prerenderPaths(),
            ...await contentRouting.prerenderPaths(),
            ...(await pages.getAllDetailed()).flatMap(page => [
                `/${page.slug}`,
                `/api/content/pages/${page.id}`
            ]),
        ]
    },
} satisfies Config
