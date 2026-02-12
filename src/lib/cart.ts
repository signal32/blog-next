import { create } from "zustand"
import { Product } from "./products.server"

interface ProductDetails {
    qty: number
}

interface Cart {
    products: Map<Product, ProductDetails>
    addProduct(product: Product, details: ProductDetails): void,
    updateProduct(product: Product, details: ProductDetails): void,
    removeProduct(product: Product): void,
}

export const useCart = create<Cart>()((set, get) => ({
    products: new Map(),

    addProduct(product, details) {
        const products = get().products
        const current = products.get(product)
        if (current) {
            products.set(product, {
                qty: current.qty + details.qty
            })
        }
        else {
            products.set(product, details)
        }
        set({ products })
    },

    updateProduct(product, details) {
        const products = get().products
        products.set(product, details)
        set({ products })
    },

    removeProduct(product) {
        const products = get().products
        products.delete(product)
        set({ products })
    }

}))
