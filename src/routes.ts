import { type RouteConfig, RouteConfigEntry, index, prefix, route } from '@react-router/dev/routes'
import { Content } from './lib/content.server'
import { products } from './lib/products.server'
import { posts } from './lib/posts.server'


function contentCustomFileRoutes(contents: Content[]) {
    const routes: RouteConfigEntry[] = []
    for (const content of contents) {
        if (!content.customRouteFile) continue
        routes.push(route(`products/${content.slug}`, content.customRouteFile))
    }
    return routes
}

export default [
    index('routes/home.tsx'),
    route('contact', './routes/contact.tsx'),
    route(':slug', './routes/page.tsx'),
    route('basket', './routes/basket.tsx'),
    route('order', './routes/order.tsx'),
    ...posts.routes(),
    ...products.routes(),
    ...contentCustomFileRoutes(await products.getAllDetailed()),
    route('api/content-list', './routes/api/contentList.ts'),
    route('api/content/:libraryId/:contentId', './routes/api/contentDetails.ts'),
] satisfies RouteConfig
