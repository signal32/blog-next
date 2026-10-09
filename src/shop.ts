import { defineClient } from "shop";
import { env } from "./lib/utils";

export const SHOP_URL = env('VITE_BLOG_SHOP_URL')
if (!SHOP_URL) throw new Error('VITE_BLOG_SHOP_URL env must be set.')

export const SHOP = defineClient(SHOP_URL)
