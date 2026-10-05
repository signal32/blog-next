import { Content, ContentLibrary, defineContent, defineContentRouting } from "./content.server";
import { pages } from "./pages.server";
import { posts } from "./posts.server";
import { products } from "./products.server";

const ALL_CONTENT = {
    posts,
    pages,
    products,
}

export const all: ContentLibrary<Content> = defineContent(
    Object.entries(ALL_CONTENT).map(([name, content]) => {
        // Prefix prevents a collision if content from different libraries share the same id
        const prefix = `${name}_`
        return ({
            descriptors: async () => {
                const all = await content.getAll()
                return all.map(d => ({ id: `${prefix}${d.id}` }))
            },
            loader: ({ id }) => {
                return content.getById(id.replace(prefix, ''));
            }
        });
    }),
)

export const allRouting = defineContentRouting(all, {
    basePath: 'content',
    listPage: './routes/content/list.tsx',
    indexPage: './routes/content/index.tsx',
    pageSize: 10,
})
