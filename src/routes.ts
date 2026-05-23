import { type RouteConfig, index, prefix, route } from '@react-router/dev/routes'
import { CUSTOM_SIGN_PRODUCT_ID, products } from './lib/products.server'

export const CUSTOM_SIGN_PRODUCT = await products.getById(CUSTOM_SIGN_PRODUCT_ID)

export default [
    index('routes/home.tsx'),
    // route('simulation', 'routes/simulation.tsx'),
    route(':slug', './routes/page.tsx'),
    route('basket', './routes/basket.tsx'),
    route('order', './routes/order.tsx'),
    ...prefix('blog', [
        index('routes/blog/index.tsx'),
        route(':slug', './routes/blog/post.tsx')
    ]),
    ...prefix('product', [
        route(':slug', './routes/product/product.tsx'),
        route(CUSTOM_SIGN_PRODUCT?.slug, './routes/product/signProduct.tsx'),
    ]),
    ...prefix('shop', [
        index('routes/product/index.tsx'),
    ]),
    route('api/content-list', './routes/api/contentList.ts'),
    route('api/content/:libraryId/:contentId', './routes/api/contentDetails.ts'),
] satisfies RouteConfig
