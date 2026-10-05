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
    getByTag: (tag: string) => Promise<T[]>
    getCache: () => Promise<{
        contentById: Map<string, () => Promise<T | undefined>>
        idBySlug: Map<string, string>
        idByName: Map<string, string>
        idsByTag: Map<string, string[]>
    }>
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
    listPage?: string //
    /** FS path to main content display page module relative to src directory.*/
    contentPage?: string,
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
                cache.contentById.set(descriptor.id, () => source.loader(descriptor))
                cache.idBySlug.set(content.slug, descriptor.id)
                cache.idByName.set(content.name, descriptor.id)

                for (const tag of content.tags ?? []) {
                    const ids = cache.idsByTag.get(tag) ?? []
                    cache.idsByTag.set(tag, [...ids, descriptor.id])
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
         async getCache() {
            await initCache()
            return cache
        },

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

        getById,

        getBySlug(slug: string) {
            return getById(cache.idBySlug.get(slug) || '')
        },

        getByName(name: string) {
            return getById(cache.idByName.get(name) || '')
        },

        async getByTag(tag: string) {
            const content = await Promise.all(
                (cache.idsByTag.get(tag) ?? [])
                    .map(id => this.getById(id))
            );
            return content.filter(c => c !== undefined);
        },
    }
}

export type ListPageContent<T extends Content> = {
    page: number,
    totalPages: number,
    content: T[],
    nextPagePath?: string,
    prevPagePath?: string,
    basePath: string,
    tags: { tag: string, path: string, count: number, }[],
    currentTag?: string,
}

export type ContentRouting<T extends Content> = {
    pages: (tag?: string) => Promise<number>
    page: (pageNo: number, tag?: string) => Promise<T[]>
    loadPage: (args: LoaderFunctionArgs) => Promise<ListPageContent<T>>

    routes: () => RouteConfigEntry[]
    prerenderPaths: () => Promise<string[]>,
}

export function defineContentRouting<T extends Content>(library: ContentLibrary<T>, config: ContentRoutingConfig): ContentRouting<T> {
    return {
        routes() {
            return prefix(config.basePath, [
                index(config.indexPage),
                ...config.contentPage ? [route(':slug', config.contentPage)] : [],
                ...config.listPage ? [route('tag?/:tag?/page?/:page?', config.listPage)] : [],
            ])
        },

        async prerenderPaths() {
            const cache = await library.getCache()
            return [
                // Index
                `/${config.basePath}`,
                // Content pages
                ...(await library.getAllDetailed()).flatMap(content => [
                    `/${config.basePath}/${content.slug}`,
                    `/api/content/${config.basePath}/${content.id}`
                ]),
                // List pages
                `/${config.basePath}/page`,
                ...range(1, await this.pages() + 1).map(
                    p => `/${config.basePath}/page/${p}`
                ),
                // Tag list pages
                `/${config.basePath}/tag/`,
                ... (await Promise.all(cache.idsByTag
                    .keys()
                    .map(async tag => [
                        `/${config.basePath}/tag/${tag}/`,
                        `/${config.basePath}/tag/${tag}/page`,
                        ...range(1, await this.pages(tag) + 1).map(
                            p => `/${config.basePath}/tag/${tag}/page/${p}`
                        )
                    ])
                )).flat()
            ]
        },

        async pages(tag?: string) {
            const cache = await library.getCache()
            const contentCount = tag
                ? cache.idsByTag.get(tag)?.length ?? 0
                : cache.contentById.size
            return Math.ceil(contentCount / config.pageSize)
        },

        async page(pageNo, tag) {
            const cache = await library.getCache()
            const start = pageNo * config.pageSize
            const end = start + config.pageSize
            const ids = (tag
                ? (cache.idsByTag.get(tag) ?? [])
                : cache.contentById.keys().toArray()
            ).slice(start, end)

            return Promise
                .all(ids.map(id => library.getById(id)))
                .then(content => content.filter(content => content !== undefined))
        },

        async loadPage({params}) {
            const tag = params['tag']
            const page = +(params['page'] ?? 1)
            const totalPages = await this.pages(tag)
            const content = await this.page(page - 1, tag)
            const cache = await library.getCache()

            return {
                page,
                totalPages,
                content,
                nextPagePath: page < totalPages
                    ? `/${config.basePath}${tag ? `/tag/${tag}` : ''}/page/${page + 1}`
                    : undefined,
                prevPagePath: page > 1
                    ? `/${config.basePath}${tag ? `/tag/${tag}` : ''}/page/${page - 1}`
                    : undefined,
                tags: cache.idsByTag.entries().toArray().map(([tag, content]) => ({
                    tag,
                    path: `/${config.basePath}/tag/${tag}`,
                    count: content.length
                })).toSorted((a, b) => b.count - a.count),
                currentTag: tag,
                basePath: `/${config.basePath}`
            }
        },

    }
}
