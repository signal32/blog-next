import { create } from "zustand"
import { persist, createJSONStorage } from 'zustand/middleware'
import { Order, Product, updateOrderProductConfig, Config, configId as getConfigId } from "store"

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

            addProduct(product, config, configId = getConfigId(config)) {
                const { order } = get()
                console.log({ configId })

                const current = order.products[product.id]?.configs[configId]
                if (current) {
                    updateOrderProductConfig(
                        prev => ({
                            ...prev,
                            quantity: prev.quantity + config.quantity
                        }),
                        order,
                        product.id,
                        configId
                    )
                }
                else {
                    order.products[product.id] = {
                        product,
                        configs: {
                            ...order.products[product.id]?.configs,
                            [configId]: config
                        }
                    }
                }
                set({ order })
            },

            updateProduct(productId, details, configId) {
                const { order } = get()
                updateOrderProductConfig(details, order, productId, configId)
                set({ order })
            },

            removeProduct(productId, configId) {
                const { order } = get()

                if (configId) {
                    const product = order.products[productId]
                    if (!product) throw new Error('no product')

                    delete product.configs[configId]
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
