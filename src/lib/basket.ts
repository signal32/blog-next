import { create } from "zustand"
import { persist, createJSONStorage } from 'zustand/middleware'
import { Order, Product, updateOrderProductConfig, DEFAULT_CONFIG, Config } from "store"

export interface Basket {
    order: Order,
    addProduct(product: Product, config: Config, configId?: string): void,
    updateProduct(productId: string, config: Config | ((current: Config) => Config), configId?: string): void,
    removeProduct(productId: string, optionId?: string): void,
}

export const useBasket = create<Basket>()(
    persist(
        (set, get) => ({
            order: {
                id: '', // TODO: generate a uuid
                products: {}
            },

            addProduct(product, option, optionId = DEFAULT_CONFIG) {
                const { order } = get()

                const current = order.products[product.id]
                if (current) {
                    updateOrderProductConfig(
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
                        configs: {
                            [optionId]: option
                        }
                    }
                }
                set({ order })
            },

            updateProduct(productId, details, optionId = DEFAULT_CONFIG) {
                const { order } = get()
                updateOrderProductConfig(details, order, productId, optionId)
                set({ order })
            },

            removeProduct(productId, optionId = DEFAULT_CONFIG) {
                const { order } = get()

                if (optionId) {
                    const product = order.products[productId]
                    if (!product) throw new Error('no product')

                    delete product.configs[optionId]
                    if (Object.keys(product.configs).length === 0) {
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
