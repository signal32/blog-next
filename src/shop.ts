import { ShopClient } from "store";
import { env } from "./lib/utils";

const shopUrl = env('VITE_BLOG_SHOP_URL')

if (!shopUrl) {
    throw new Error('VITE_BLOG_SHOP_URL env must be set.')
}

export const SHOP = new ShopClient(shopUrl)
