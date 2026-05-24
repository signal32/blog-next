import { ShopClient } from "store";

let shopUrl
if (typeof window !== 'undefined') {
    shopUrl = import.meta.env['VITE_BLOG_SHOP_URL']
}
else {
    //@ts-expect-error
    process.loadEnvFile()
    shopUrl = process.env['VITE_BLOG_SHOP_URL']
}

if (!shopUrl) {
    throw new Error('VITE_BLOG_SHOP_URL env must be set.')
}

export const SHOP = new ShopClient(shopUrl)
