import { join } from "path";
import fs from 'fs';

const DELIMINATOR = '_';

export interface ContentDescriptor {
    id: string,
    slug: string,
    name: string,
    fileName: string,
}

export interface Content extends ContentDescriptor {
    baseUrl: string,
    created?: string,
    modified?: string,
    excerpt?: string,
    thumbnail?: string,
    coverImage?: string,
    public?: boolean,
}

export interface ContentLocation {
    fileName: string,
    path: string,
}

export const CACHE = {
    id: new Map<string, { descriptor: ContentDescriptor, dir: string }>(),
    slug: new Map<string, string>(), // slug -> id
    name: new Map<string, string>(), // name -> id
    dir: new Map<string, string[]>(), // dir -> child content ids
}

/**
 * Extracts id, slug and name from file name of the form:
 * `<id>_<slug/name>.<extension>`
 *
 * Extensions are ignored and have no effect on parsed details
 * Id is optional, and will be replaced with slug ig not found
 */
export function defineFileSource<T extends Content>(dir: string, loader: (descriptor: ContentDescriptor, dir: string) => T | Promise<T>): Source<T> {

    const fileNameToDescriptor = (fileName: string): ContentDescriptor => {
        const idEndIdx = Math.max(fileName.indexOf(DELIMINATOR), 0)
        const nameStartIdx = idEndIdx > 0 ? idEndIdx + DELIMINATOR.length : 0
        const extensionIdx = fileName.lastIndexOf('.')

        return {
            fileName,
            id: idEndIdx > 0
                ? fileName.substring(0, idEndIdx)
                : fileName,
            slug: fileName.substring(nameStartIdx, extensionIdx > 0 ? extensionIdx : undefined),
            name: fileName.substring(nameStartIdx, extensionIdx > 0 ? extensionIdx : undefined),
        }
    }


    return {
        descriptors: async () => fs.readdirSync(dir).map(fileNameToDescriptor),
        loader: async (descriptor) => loader(descriptor, join(dir, descriptor.fileName))
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
    sources: Source<T>[]
): ContentLibrary<T> {
    const cache = {
        id: new Map<string, { descriptor: ContentDescriptor, source: Source<T>, content?: T }>(),
        slug: new Map<string, string>(), // slug -> id
        name: new Map<string, string>(), // name -> id
        dir: new Map<string, string[]>(), // dir -> child content ids
    }

    async function initCache() {
        if (cache.id.size) return

        const descriptors = await Promise.all(
            sources.map(
                async source => (await source.descriptors()).map(descriptor => ({ descriptor, source }))
            )
        )
        for (const { descriptor, source } of descriptors.flat()) {
            cache.id.set(descriptor.id, { descriptor, source });
            cache.slug.set(descriptor.slug, descriptor.id);
            cache.name.set(descriptor.name, descriptor.id);
        }
    }

    const getById = async (id: string) => {
        await initCache()

        const data = cache.id.get(id);
        if (!data) return
        if (!data?.content) {
            data.content = await data.source.loader(data.descriptor)
            cache.id.set(id, data)
        }

        return data.content
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

        getById,
        getBySlug(slug: string) {
            return getById(cache.slug.get(slug) || '')
        },
        getByName(name: string) {
            return getById(cache.name.get(name) || '')
        }
    }
}
