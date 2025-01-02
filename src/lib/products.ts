import { join } from "path";
import fs from 'fs';
import { FileDetails } from "./file";
import { Content, ContentDescriptor, defineContent } from "./content";
import { Post } from './posts';

export interface Product extends Content {
    published: Date,
    similar?: [ProductId],
    children?: [ProductId],
    parent?: ProductId,
    requirements?: Requirement[],
    description?: string,
    media?: ProductMedia,
    files?: {
        /** Primary file ID */
        primary: string,
        /** Miscellaneous files belonging to the product */
        other: {slug: string, tag?: FileTag}[]
    }
}

export type FileTag = 'manual' | 'misc'
export type Requirement = ExternalRequirement | InternalRequirement;

export interface ExternalRequirement {
    type: 'external'
    site: string,
    id: string,
    href: [string],
}

export interface InternalRequirement {
    type: 'internal',
    id: string,
}

export interface ProductMedia {
    banner?: string,
    gallery?: string[],
    videos?: string[],
}

export type ProductId = string;

export const products = defineContent<Product>('products', async(descriptor, path) => {
    const metaPath = join(path, 'metadata.json');
    const metaData = fs.readFileSync(metaPath, 'utf8');

    const product = JSON.parse(metaData, (key, value) => {
        if (key == 'published') return new Date(value);
        else return value;
    }) as Product;

    const descPath = join(path, 'description.md');
    const descData = fs.readFileSync(descPath, 'utf8');
    product.description = descData.toString() || 'No description';

    return {
        ...descriptor,
        ...product,
        ...(product.media?.banner ? { coverImage: product.media.banner} : {}), // Can't be undefined
        ...(product.description && !product.excerpt ? { excerpt: product.description.slice(0, 255).trim()} : {}),
        baseUrl: '/product',
    }
});
