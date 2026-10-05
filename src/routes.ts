import { type RouteConfig, RouteConfigEntry, index, route } from '@react-router/dev/routes'
import { allRouting } from './lib/all.server'
import { Content } from './lib/content.server'
import { postRouting } from './lib/posts.server'
import { productRouting, products } from './lib/products.server'


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
    ...postRouting.routes(),
    ...productRouting.routes(),
    ...allRouting.routes(),
    ...contentCustomFileRoutes(await products.getAllDetailed()),
    route('api/content-list', './routes/api/contentList.ts'),
    route('api/content/:libraryId/:contentId', './routes/api/contentDetails.ts'),
] satisfies RouteConfig
