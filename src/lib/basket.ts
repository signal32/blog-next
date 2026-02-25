import { create } from "zustand"
import { persist, createJSONStorage } from 'zustand/middleware'
import { Option, Order, Product, updateOrderProductOption, DEFAULT_OPTION } from "store"

export interface Basket {
    order: Order,
    addProduct(product: Product, option: Option, optionId?: string): void,
    updateProduct(productId: string, option: Option | ((current: Option) => Option), optionId?: string): void,
    removeProduct(productId: string, optionId?: string): void,
}

export const useBasket = create<Basket>()(
    persist(
        (set, get) => ({
            order: {
                id: '', // TODO: generate a uuid
                products: {}
            },

            addProduct(product, option, optionId = DEFAULT_OPTION) {
                const { order } = get()

                const current = order.products[product.id]
                if (current) {
                    updateOrderProductOption(
                        prev => ({
                            ...prev,
                            quantity: prev.quantity + option.quantity
                        }),
                        order,
                        product.id,
                        optionId
                    )
                }
                else {
                    order.products[product.id] = {
                        product,
                        options: {
                            [optionId]: option
                        }
                    }
                }
                set({ order })
            },

            updateProduct(productId, details, optionId = DEFAULT_OPTION) {
                const { order } = get()
                updateOrderProductOption(details, order, productId, optionId)
                set({ order })
            },

            removeProduct(productId, optionId = DEFAULT_OPTION) {
                const { order } = get()

                if (optionId) {
                    const product = order.products[productId]
                    if (!product) throw new Error('no product')

                    delete product.options[optionId]
                    if (Object.keys(product.options).length === 0) {
                        delete order.products[productId]
                    }
                }
                else delete order.products[productId]

                set({ order })
            }
        }),
        {
            name: 'basket-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    ))
