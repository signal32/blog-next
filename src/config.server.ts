import { ContentLibrary, Content } from "./lib/content.server"
import { files } from "./lib/file.server"
import { pages } from "./lib/pages.server"
import { posts } from "./lib/posts.server"
import { products } from "./lib/products.server"

//@ts-expect-error
process.loadEnvFile()

export interface ServerConfig {
    content: Record<string, ContentLibrary<Content>>,
    customSignProductId?: string,
}

export const SERVER_CONFIG: ServerConfig = {
    content: {
        products,
        posts,
        pages,
        files,
    },
    customSignProductId: process.env['BLOG_CUSTOM_SIGN_PRODUCT_ID']
}
