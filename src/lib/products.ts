
export interface Product {
    id: ProductId,
    similar: [ProductId],
    children: [ProductId],
    parent: ProductId,
    requirements: [ProductId | ExternalRequirement]
}

export interface ExternalRequirement {
    site: string,
    id: string,
    href: [string],
}

export type ProductId = string;