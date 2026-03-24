import fs from 'fs';
import { join } from "path";
import { createClient } from "store";
import { createSelect, fromSelect } from "store/src/product";
import { Content, defineContent, defineFileSource } from "./content.server";
import { Product as StoreProduct } from 'store'

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
    {
        async descriptors() {
            const products = await createSelect(shopClient).then(fromSelect)
            return products.map(product => ({
                fileName: '',
                id: product.id,
                name: product.name,
                slug: product.name.replaceAll(' ', '-')
            }))
        },
        async loader(descriptor) {
            const [product] = await createSelect(shopClient).eq('id', descriptor.id).then(fromSelect)
            return {
                ...descriptor,
                published: new Date('10/10/2025'),
                coverImage: product?.meta.headerImageUrl,
                media: {
                    gallery: product?.meta.imageUrls,
                    banner: product?.meta.headerImageUrl
                },
                baseUrl: '/product',
                created: '10 Jan 2020',
                public: true,
                storeProduct: product
            }
        }
    }
])


const shopClient = createClient('http://localhost:3000')

export const CUSTOM_SIGN_PRODUCT_ID = '5bb0a699-f964-431e-9605-0d896b642108'
