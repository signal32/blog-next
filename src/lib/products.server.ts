import fs, { existsSync } from 'fs';
import { join } from "path";
import { Product as ShopProduct } from "shop";
import { Content, defineContent, defineContentRouting, defineFileSource } from "./content.server";
import { env } from './utils';


export interface Product extends Content, ShopProduct {
    published?: string,
    updated?: string,
    similar?: [ProductId],
    children?: [ProductId],
    parent?: ProductId,
    requirements?: Requirement[],
    description?: string,
    media?: ProductMedia,
    configurationOptions?: ConfigurationOptions,
    stripePriceId?: string,
    donateUrl?: string,
    postPurchaseInstructions?: string,
}

export type ConfigurationOption = {
    type: 'select'
    values: string[]
} | {
    type: 'input'
    value: string
} | {
    type: 'number'
    value: number
}

export type ConfigurationOptions = Record<string, ConfigurationOption>


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

const modules = import.meta.glob('../../content/products/**/*.ts')

export const products = defineContent<Product>([
    // Load products from local static files
    defineFileSource('content/products', async (descriptor, path) => {

        const jsPath = join(path, 'metadata.ts')
        const jsonPath = join(path, 'metadata.json');
        let product: Product

        const importer = modules['../../' + jsPath]
        if (importer) {
            const mod = (await importer()) as { default: Product };
            product = mod.default;
        }
        else if (existsSync(jsonPath)) {
            const file = fs.readFileSync(jsonPath, 'utf8');
            product = JSON.parse(file, (key, value) => {
                if (key == 'published') return new Date(value);
                else return value;
            }) as Product;
        }
        else {
            throw new Error('Could find product metadata file.' + jsPath)
        }

        const descPath = join(path, 'description.md');
        const descData = fs.readFileSync(descPath, 'utf8');
        product.description = descData.toString() || 'No description';

        return {
            ...descriptor,
            ...product,
            ...(product.media?.banner ? { coverImage: product.media.banner } : {}), // Can't be undefined
            ...(product.description && !product.excerpt ? { excerpt: product.description.slice(0, 255).trim() } : {}),
            url: `${env('VITE_BLOG_PUBLIC_URL')}/api/content/products/${descriptor.id}`,
            baseUrl: '/products',
        }
    }),
])

export const productRouting = defineContentRouting(products, {
    basePath: 'products',
    contentPage: './routes/product/product.tsx',
    listPage: './routes/product/list.tsx',
    indexPage: './routes/product/index.tsx',
    pageSize: 3
})
