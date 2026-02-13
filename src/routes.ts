import { type RouteConfig, index, prefix, route } from '@react-router/dev/routes'

export default [
    index('routes/home.tsx'),
    // route('simulation', 'routes/simulation.tsx'),
    route(':slug', './routes/page.tsx'),
    route('basket', './routes/basket.tsx'),
    ...prefix('blog', [
        index('routes/blog/index.tsx'),
        route(':slug', './routes/blog/post.tsx')
    ]),
    ...prefix('product', [
        route(':slug', './routes/product/product.tsx')
    ]),
    ...prefix('shop', [
        index('routes/product/index.tsx'),
    ])
    // route('login', './routes/login.tsx'),
    // route('logout', './routes/logout.tsx'),
    // route('editor', './routes/editor.tsx'),
    // route('activities', './routes/activities.tsx'),
    // route('activity/:activitySlug', './routes/activity.tsx'),
    // ...prefix('routes', [
    //     index('./routes/routes.tsx'),
    //     route(':routeId', './routes/route.tsx'),
    //     route(':routeId/map', './routes/routeMap.tsx'),
    // ])
] satisfies RouteConfig
