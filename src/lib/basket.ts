import { create } from "zustand"
import { persist, createJSONStorage } from 'zustand/middleware'
import { Product } from "./products.server"

interface ProductDetails {
    qty: number
}

export interface Basket {
    products: Record<string, { product: Product, details: ProductDetails }>
    addProduct(product: Product, details: ProductDetails): void,
    updateProduct(product: Product, details: ProductDetails): void,
    removeProduct(product: Product): void,
}

export const useBasket = create<Basket>()(
    persist(
        (set, get) => ({
            products: {},

            addProduct(product, details) {
                const products = get().products
                const current = products[product.id]
                if (current) {
                    products[product.id] = {
                        product,
                        details: {
                            qty: current.details.qty + details.qty

                        }
                    }
                }
                else {
                    products[product.id] = { product, details }
                }
                set({ products })
            },

            updateProduct(product, details) {
                const products = get().products
                products[product.id] = { product, details }
                set({ products })
            },

            removeProduct(product) {
                const products = get().products
                delete products[product.id]
                set({ products })
            }

        }),
        {
            name: 'basket-storage',
            storage: createJSONStorage(() => sessionStorage),

        }
    ))
