import { useBasket } from "#src/lib/basket";
import { type Product } from "#src/lib/products.server";
import { cn } from "#src/lib/utils.ts";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Config, configId as getConfigId } from "store";
import { H4, H6, P } from "./common/typography";
import { Button } from "./ui/button";
import { ArrowRight, Check, LucideLoaderCircle, ShoppingBasket, Trash, X } from "lucide-react";
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "./ui/popover";

export type OnAddToBasketCb = (config: Config) => Promise<boolean | undefined>

export function AddToBasketButton(props: {
    product: Product,
    config: Config
    onAddToBasket?: OnAddToBasketCb,
}) {
    const basket = useBasket()
    const storeProduct = props.product.storeProduct
    const configId = useMemo(() => getConfigId(props.config), [props.config])

    const configs = Object.entries(basket.order.products[props.product.id]?.configs ?? {})
    const [adding, setAdding] = useState(false)

    return storeProduct !== undefined && <>
        {basket.order.products[props.product.id]?.configs[configId]
            ? <div className="flex justify-between items-center bg-green-700/50 p-2 rounded-lg shadow">
                <P>In your basket!</P>
                <Link to="/basket"><Button className="bg-green-700/50 hover:bg-green-700/70 shadow dark:text-white">View <ArrowRight /></Button></Link>
            </div>
            : <Button className="w-full shadow" onClick={async () => {
                setAdding(true)
                if ((await props.onAddToBasket?.(props.config)) ?? true)
                    basket.addProduct(
                        storeProduct,
                        props.config
                    );
                setAdding(false)
            }}>
                {adding
                    ? <><LucideLoaderCircle className="animate-spin" /> Adding</>
                    : <><ShoppingBasket /> Add to basket</>
                }</Button>
        }

        {configs.length > 0 && <>
            <P className="text-sm pt-2">In your basket:</P>
            {configs.map(([thisConfigId, config], index) => {
                const currentConfigId = getConfigId(config)
                return <Link to={`/product/${props.product.slug}?configId=${currentConfigId}`}>
                    <div
                        key={index}
                        className={cn(
                            "flex justify-between items-center bg-card p-2 my-2 rounded-lg cursor-pointer transition-colors",
                            configId === currentConfigId ? "outline-2 outline-primary" : ""
                        )}
                    >
                        <div className="flex flex-col text-sm text-card-foreground grow">{Object
                            .entries(config.options)
                            .filter(([_, option]) => !option.hidden)
                            .map(([id, option]) => <p key={id}><b className="capitalize">{id}</b>: {option.value}</p>)}
                        </div>
                        <RemoveFromBasketButton product={props.product} configId={thisConfigId} />

                    </div>
                </Link>;
            })
            }
        </>}

    </>
}

function RemoveFromBasketButton(props: {
    product: Product,
    configId: string,
}) {
    const [removePopoverOpen, setRemovePopoverOpen] = useState(false)
    const basket = useBasket()

    return <Popover open={removePopoverOpen} onOpenChange={setRemovePopoverOpen}>
        <PopoverTrigger asChild>
            <Button
                variant='ghost'
            >
                <Trash />
            </Button>
        </PopoverTrigger>

        <PopoverContent>
            <PopoverHeader>
                <PopoverTitle>Remove from basket?</PopoverTitle>
                <div className="flex flex-row gap-2">
                    <Button
                        variant="destructive"
                        className="grow"
                        onClick={() => {
                            basket.removeProduct(props.product.id, props.configId)
                            setRemovePopoverOpen(false)
                        }}
                    ><Check /> Confirm</Button>
                    <Button
                        variant='outline'
                        className="grow"
                        onClick={() => {
                            setRemovePopoverOpen(false)
                        }}
                    ><X /> Cancel</Button>
                </div>
            </PopoverHeader>
        </PopoverContent>
    </Popover>
}
