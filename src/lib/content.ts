import { join } from "path";
import fs from 'fs';

const CONTENT_DIR = join(process.cwd(), 'content');
const DELIMINATOR = '--';

export interface ContentDescriptor {
    id: string,
    slug: string,
    name: string,
    fileName: string,
}

export interface ContentLocation {
    fileName: string,
    path: string,
}

export const CACHE = {
    id: new Map<string, {descriptor: ContentDescriptor, dir: string}>(),
    slug: new Map<string, string>(), // slug -> id
    name: new Map<string, string>(), // name -> id
    dir: new Map<string, string[]>(), // dir -> child content ids
}

const parseFileName = (fileName: string): ContentDescriptor => {
    const split = fileName.indexOf(DELIMINATOR);
    // const extension = fileName.lastIndexOf('.');
    const id = fileName.substring(0, split);
    const slug = fileName.substring(split + DELIMINATOR.length /*, extension */);
    const name = slug; // TODO format this for display
    return {id, slug, name, fileName}
}

const getAllFiles = (dir: string) => fs.readdirSync(dir).map(parseFileName);

/**
 * Load content from file or cache if it exists.
 * If loading from file, the cache will be created.
 */
export const loadContent = (dir: string, useCache = true) => {
    const cached = CACHE.dir.get(dir);
    if (cached && useCache ) return cached.map((item) => CACHE.id.get(item)?.descriptor).filter(item => item != undefined) as ContentDescriptor[]
    else {
        const fileDir = join(CONTENT_DIR, dir);
        const descriptors = getAllFiles(fileDir);
    
        // Cache file descriptors for indexed lookup
        descriptors.forEach(descriptor => {
            CACHE.id.set(descriptor.id, {descriptor, dir: fileDir});
            CACHE.slug.set(descriptor.slug, descriptor.id);
            CACHE.name.set(descriptor.name, descriptor.id);
        });
    
        // Cache each id of everything in this dir
        CACHE.dir.set(dir, descriptors.map(item => item.id));
        return descriptors
    }
}

const getById = (id: string) => CACHE.id.get(id);
const getBySlug = (slug: string) => getById(CACHE.slug.get(slug) || '');
const getByName = (name: string) => getById(CACHE.name.get(name) || '');

// const get = (value: string, type: 'id' | 'slug' | 'name' = 'id' ) => {
//     switch(type) {
//         case 'slug': return getBySlug(value);
//         case 'name': return getByName(value);
//         case 'id': default: return getById(value);
//     }
// }

export type Loader<T> = (descriptor: ContentDescriptor, path: string) => T;

/**
 * Defines methods for loading content of type T.
 * @param dir Subdirectory of `CONTENT_DIR` that contains content of T
 * @param loader Method to transform each `ContentDescriptor` into T
 * @returns 
 */
export function defineContent<T>(dir: string, loader: Loader<T>): {
    getAll: () => ContentDescriptor[],
    getById: (id: string) => T | undefined,
    getBySlug: (slug: string) => T | undefined,
    getByName: (name: string) => T | undefined,
} {
    console.log(`Reading content from ${dir}`);
    loadContent(dir);
    
    return {
        getAll: () => loadContent(dir),
        getById: (id) => {
            const content = getById(id);
            return content ? loader(content.descriptor, join(content.dir, content.descriptor.fileName)) : undefined;
        },
        getBySlug: (slug) => {
            const content = getBySlug(slug);
            return content ? loader(content.descriptor, join(content.dir, content.descriptor.fileName)) : undefined;
        },
        getByName: (name) => {
            const content = getByName(name);
            return content ? loader(content.descriptor, join(content.dir, content.descriptor.fileName)) : undefined;
        }
    }
}