import { SHOP } from '#src/shop.ts';
import fs from 'fs';
import { join } from "path";
import { Product as StoreProduct } from "shop";
import { Content, defineContent, defineFileSource } from "./content.server";

export interface Product extends Content {
    published?: Date,
    updated?: Date,
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
        other: { slug: string, tag?: FileTag }[]
    },
    storeProduct?: StoreProduct
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

export const products = defineContent<Product>([
    // Load products from local static files
    defineFileSource('content/products', (descriptor, path) => {
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
            ...(product.media?.banner ? { coverImage: product.media.banner } : {}), // Can't be undefined
            ...(product.description && !product.excerpt ? { excerpt: product.description.slice(0, 255).trim() } : {}),
            baseUrl: '/product',
        }
    }),
    // Load products from Shop web service
    {
        async descriptors() {
            const products = await SHOP.findProducts({})
            return products.map(product => ({
                fileName: '',
                id: product.id,
                name: product.name,
                slug: product.name.replaceAll(' ', '-')
            }))
        },
        async loader(descriptor) {
            const [product] = await SHOP.findProducts({ productIds: [descriptor.id] })
            if (!product) throw new Error(`Could not load product with id ${descriptor.id}`)
            return {
                ...descriptor,
                coverImage: product?.meta.headerImageUrl,
                media: {
                    gallery: product?.meta.imageUrls,
                    banner: product?.meta.headerImageUrl
                },
                baseUrl: '/product',
                public: product?.available,
                storeProduct: product,
                description: product?.description,
                excerpt: product?.meta.excerpt,
                customRouteFile: product?.meta.customRouteFile,
                created: new Date(product.created),
                published: new Date(product.created),
                updated: new Date(product.updated),
            }
        }
    }
])
