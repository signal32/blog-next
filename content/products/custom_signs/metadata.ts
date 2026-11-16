import type { Product } from '#src/lib/products.server.ts'
import { SHOP_URL } from '#src/shop.ts'

export default {
    name: 'Train Simulator Classic Custom Signs',
    slug: 'Train-Simulator-Classic-Custom-Signage',
    public: true,
    excerpt: 'Build your custom signs online and have them in-game, ready for use, within minutes.',
    media: {
        banner: 'https://s3.finch.hamishweir.uk/shop-public/sign_images/signs_all_2-small.jpg',
        gallery: [
            'https://s3.finch.hamishweir.uk/shop-public/sign_images/signs_all_1-small.jpg',
            'https://s3.finch.hamishweir.uk/shop-public/sign_images/signs_all_2-small.jpg',
            'https://s3.finch.hamishweir.uk/shop-public/sign_images/sign_small_1-small.jpg',
            'https://s3.finch.hamishweir.uk/shop-public/sign_images/signs_totem_1-small.jpg',
            'https://s3.finch.hamishweir.uk/shop-public/sign_images/sign_large_1-small.jpg',
        ],
    },
    created: '2026-06-10T00:00:00Z',
    published: '2026-06-10T00:00:00Z',
    customRouteFile: 'routes/product/signProduct.tsx',
    fulfillmentWebhook: `${SHOP_URL}/signs/fulfillSignOrder`,
    stripePriceId: 'price_1T0LBKIqdfED53D6B17D0slE',
    files: [
        {
            label: 'Manual',
            type: 'direct',
            href: 'https://wow.com/test.pdf',
            visibility: 'public',
            tags: ['manual'],
        },
        {
            label: 'Manual',
            type: 'bucket',
            host: '',
            key: 'test',
            bucket: 'test',
            visibility: 'purchased',
            tags: [
                'ts_package',
                'ts_package_dep:RSC/BrightonMainline',
                'ts_package_dep:RSC/BrightonMainline',
            ],
        },
    ],
} satisfies Partial<Product>
