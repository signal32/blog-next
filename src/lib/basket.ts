import { create } from "zustand"
import { Product } from "./products.server"

interface ProductDetails {
    qty: number
}

export interface Basket {
    products: Map<string, { product: Product, details: ProductDetails }>
    addProduct(product: Product, details: ProductDetails): void,
    updateProduct(product: Product, details: ProductDetails): void,
    removeProduct(product: Product): void,
}

export const useBasket = create<Basket>()((set, get) => ({
    products: new Map(),

    addProduct(product, details) {
        const products = get().products
        const current = products.get(product.id)
        if (current) {
            products.set(product.id, {
                product,
                details: {
                    qty: current.details.qty + details.qty

                }
            })
        }
        else {
            products.set(product.id, { product, details })
        }
        set({ products })
    },

    updateProduct(product, details) {
        const products = get().products
        products.set(product.id, { product, details })
        set({ products })
    },

    removeProduct(product) {
        const products = get().products
        products.delete(product.id)
        set({ products })
    }

}))
