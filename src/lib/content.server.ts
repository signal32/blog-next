import { join } from "path";
import fs from "fs";
import { range } from "./utils";
import { index, prefix, route, RouteConfigEntry } from "@react-router/dev/routes";
import { LoaderFunctionArgs } from "react-router";

export interface ContentDescriptor {
    id: string,
}

export interface Content extends ContentDescriptor {
    slug: string,
    name: string,
    baseUrl: string,
    created?: string,
    modified?: string,
    excerpt?: string,
    thumbnail?: string,
    coverImage?: string,
    public?: boolean,
    price?: number,
    customRouteFile?: string,
    tags?: [],
}

export interface ContentLocation {
    fileName: string,
    path: string,
}

/**
 * Defines a file system based content source.
 * Each file in `dir` is an item of `Content` and its filename is the `id`.
 */
export function defineFileSource<T extends Content>(dir: string, loader: (descriptor: ContentDescriptor, dir: string) => T | Promise<T>): Source<T> {
    return {
        descriptors: async () => fs.readdirSync(dir).map(id => ({ id })),
        loader: async (descriptor) => ({
            ...await loader(descriptor, join(dir, descriptor.id)),
            id: descriptor.id
        })
    }
}

export async function* iterSourceContent<T>(source: Source<T>) {
    const descriptors = await source.descriptors()
    for (const descriptor of descriptors) {
        const content = await source.loader(descriptor)
        if (content) yield {content, descriptor}
    }
}

export type Loader<T> = (descriptor: ContentDescriptor) => Promise<T | undefined>;

export type Source<T> = {
    loader: Loader<T>,
    descriptors: () => Promise<ContentDescriptor[]>
}

export type ContentLibrary<T extends Content> = {
    getAll: () => Promise<ContentDescriptor[]>
    getAllDetailed: () => Promise<T[]>
    getById: (id: string) => Promise<T | undefined>
    getBySlug: (slug: string) => Promise<T | undefined>
    getByName: (name: string) => Promise<T | undefined>

    pages: () => Promise<number>
    page: (pageNo: number) => Promise<T[]>
    loadPage: (args: LoaderFunctionArgs) => Promise<ListPageContent<T>>

    routes: () => RouteConfigEntry[]
    prerenderPaths: () => Promise<string[]>
}

export type ContentRoutingConfig = {
    /** URL path relative to app root under which content pages should be served, for example: `posts` */
    basePath: string
    /** FS path to index page module relative to src directory, for example: `./routes/posts/index.tsx` */
    indexPage: string
    /**
     * FS path to listing page module relative to src directory.
     * This should use `content.loadPage` as the `loader`.
     */
    listPage: string //
    /** FS path to main content display page module relative to src directory.*/
    contentPage: string,
    /** Number of results to be displayed on each list page. */
    pageSize: number,
}

/**
 * Defines methods for loading content of type T from a collection of abstract sources.
 * - Local files can be loaded with {@link defineFileSource}
 *
 * The content library is lazily loaded on the first call caching:
 * - Basic content metadata {@link ContentDescriptor}
 * - Mappings from content `name` and `slug` fields to its `id`
 * @returns
 */
export function defineContent<T extends Content>(
    sources: Source<T>[],
    routing?: ContentRoutingConfig,
): ContentLibrary<T> {

    const cache = {
        contentById: new Map<string, () => Promise<T | undefined>>(),
        idBySlug: new Map<string, string>(),
        idByName: new Map<string, string>(),
        idsByTag: new Map<string, string[]>(),
    }

    async function initCache() {
        if (cache.contentById.size) return

        await Promise.all(sources.map(async source => {
            for await (const {content, descriptor} of iterSourceContent(source)) {
                cache.contentById.set(content.id, () => source.loader(descriptor))
                cache.idBySlug.set(content.slug, content.id)
                cache.idByName.set(content.name, content.id)

                for (const tag of content.tags ?? []) {
                    const ids = cache.idsByTag.get(tag) ?? []
                    cache.idsByTag.set(tag, [...ids, content.id])
                }
            }
        }))
    }

    const getById = async (id: string) => {
        await initCache()
        const content = await cache.contentById.get(id)?.();
        if (content && content.public) return content
    };

    return {
        async getAll() {
            await initCache()
            return (await Promise.all(sources.map(source => source.descriptors()))).flat()
        },

        async getAllDetailed() {
            const items = []

            for (const item of await this.getAll()) {
                const detailedItem = await this.getById(item.id)
                if (detailedItem) items.push(detailedItem)
            }

            return items
        },

        routes() {
            return routing ? prefix(routing.basePath, [
                index(routing.indexPage),
                route(':slug', routing.contentPage),
                route('page/:page?', routing.listPage),
            ]) : []
        },

        async prerenderPaths() {
            return routing ? [
                `/${routing.basePath}`,
                ...(await this.getAllDetailed()).flatMap(content => [
                    `/${routing.basePath}/${content.slug}`,
                    `/api/content/${routing.basePath}/${content.id}`
                ]),
                `/${routing.basePath}/page`,
                ...range(1, await this.pages() + 1).map(p => `/${routing.basePath}/page/${p}`),
            ] : []
        },

        getById,
        getBySlug(slug: string) {
            return getById(cache.idBySlug.get(slug) || '')
        },
        getByName(name: string) {
            return getById(cache.idByName.get(name) || '')
        },
        async pages() {
            if (!routing) return 0

            const content = await this.getAll()
            return Math.ceil(content.length / routing.pageSize)
        },

        async page(pageNo) {
            if (!routing) return []

            const start = pageNo * routing.pageSize
            const end = start + routing.pageSize
            const content = (await this.getAll()).slice(start, end)
            let detailedContent = await Promise.all(content.map(({ id }) => getById(id)))
            return detailedContent.filter(content => content !== undefined)
        },

        async loadPage({params}) {
            const page = +(params['page'] ?? 1)
            const totalPages = await this.pages()

            return {
                page,
                totalPages,
                content: await this.page(page - 1),
                nextPagePath: routing  && page < totalPages ? `/${routing.basePath}/page/${page + 1}` : undefined,
                prevPagePath: routing && page > 1 ? `/${routing.basePath}/page/${page - 1}` : undefined,
            }
        }
    }
}

export type ListPageContent<T extends Content> = {
    page: number,
    totalPages: number,
    content: T[],
    nextPagePath?: string,
    prevPagePath?: string,
}
