import { useBasket } from "#src/lib/basket";
import { type Product } from "#src/lib/products.server";
import { cn } from "#src/lib/utils.ts";
import { useMemo } from "react";
import { Link } from "react-router";
import { Config, configId as getConfigId } from "store";
import { P } from "./common/typography";
import { Button } from "./ui/button";

export type OnAddToBasketCb = (config: Config) => Promise<boolean | undefined>

export function AddToCartButton(props: {
    product: Product,
    config: Config
    onAddToBasket?: OnAddToBasketCb,
}) {
    const basket = useBasket()
    const storeProduct = props.product.storeProduct
    const configId = useMemo(() => getConfigId(props.config), [props.config])

    return storeProduct !== undefined && <>
        {basket.order.products[props.product.id]?.configs[configId]
            ? <div className="flex justify-between items-center bg-green-700/50 p-2 rounded-lg">
                <P>In your basket!</P>
                <Link to="/basket"><Button variant='outline'>View</Button></Link>
            </div>
            : <Button className="w-full" onClick={async () => {
                if ((await props.onAddToBasket?.(props.config)) ?? true)
                    basket.addProduct(
                        storeProduct,
                        props.config
                    );
            }}>Add to basket</Button>
        }
        {Object
            .values(basket.order.products[props.product.id]?.configs ?? {})
            .map((config, index) => {
                const currentConfigId = getConfigId(config)
                return <Link to={`/product/${props.product.slug}?configId=${currentConfigId}`}>
                    <div
                        key={index}
                        className={cn(
                            "flex justify-between items-center bg-air/30 p-2 my-2 rounded-lg cursor-pointer transition-colors",
                            "hover:bg-air/75",
                            configId === currentConfigId ? "bg-air outline-1 outline-primary" : ""
                        )}
                    >
                        <div className="flex flex-col text-sm text-white/80">{Object
                            .entries(config.options)
                            .filter(([_, option]) => !option.hidden)
                            .map(([id, option]) => <p><b className="capitalize">{id}</b>: {option.value}</p>)}
                        </div>
                    </div>
                </Link>;
            })
        }
    </>
}
