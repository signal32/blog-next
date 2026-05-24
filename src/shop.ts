import { ShopClient } from "store";

//@ts-expect-error
process.loadEnvFile()

const shopUrl = process.env['BLOG_SHOP_URL']
if (!shopUrl) throw new Error('BLOG_SHOP_URL env must be set.')
export const SHOP = new ShopClient(shopUrl)
