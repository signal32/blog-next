import { ContentLayout } from '#src/components/app/BaseLayout'
import { P } from '#src/components/common/typography.tsx'
import { Button } from '#src/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '#src/components/ui/empty'
import { useBasket } from '#src/lib/basket'
import { products } from '#src/lib/products.server'
import { cn, formatCurrency, } from '#src/lib/utils'
import { SHOP } from '#src/shop'
import { ArrowRightIcon, LucideClockFading, Minus, Plus, ShoppingBasketIcon, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getOrderConfig, Product, ShopClient } from 'store'
import { Route } from './+types/basket'
import { ArrowRight, Check, LucideLoaderCircle, ShoppingBasket, Trash, X } from "lucide-react";
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "src/components/ui/popover";

export default function Basket({ loaderData }: Route.ComponentProps) {
    const basket = useBasket()

    const goToCheckout = async () => {
        const { url } = await SHOP.createStripePayment({
            order: basket.order,
            successUrl: `http://localhost:5173/order/${basket.order.id}?success=true`
        })
        window.location.href = url
    }

    function BasketTable() {
        const cellClassName = 'p-1'
        const basket = useBasket()

        const [calculations, setCalculations] = useState<Awaited<ReturnType<ShopClient['calculateOrder']>>>()
        useEffect(() => {
            SHOP
                .calculateOrder({ order: basket.order })
                .then(setCalculations)
                .catch(console.log)
        }, [basket])

        return calculations ? (
            <table className='table-auto w-full text-lg mb-5'>
                <thead className='text-left'>
                    <tr className='border-b-2 border-air'>
                        <th className={cellClassName}>Item</th>
                        <th className={cellClassName}>Price</th>
                        <th className={cellClassName}>Quantity</th>
                        <th className={cellClassName}>Total</th>
                        <th className={cellClassName}></th>
                    </tr>
                </thead>
                <tbody>
                    {calculations?.linePrices.map(({ productId, unitPrice, linePrice, optionId }, i) => {
                        const { product, config } = getOrderConfig(basket.order, productId, optionId)

                        return (
                            <tr key={i} className={cn(i % 2 === 0 ? 'bg-air/10' : 'bg-air/5')}>
                                <td className={cn(cellClassName)}>
                                    <Link
                                        to={`/product/${loaderData.productIdsToSlug[product.id]}?configId=${optionId}`}
                                    >
                                        <div className='flex flex-col'>
                                            <P className='hover:underline text-lg font-bold'>{product.name}</P>
                                            <div className='text-sm'>
                                                <div className="flex flex-wrap gap-x-2 text-sm opacity-80">{Object
                                                    .entries(config.options)
                                                    .filter(([_, option]) => !option.hidden)
                                                    .map(([id, option]) => <p><b className="capitalize">{id}</b>: {option.value}</p>)}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </td>
                                <td className={cellClassName}>{formatCurrency(unitPrice)}</td>
                                <td className={cn(cellClassName, 'flex flex-col-reverse md:flex-row items-center')}>
                                    <Button
                                        variant='link'
                                        size='xs'
                                        onClick={() => basket.updateProduct(
                                            product.id,
                                            { ...config, quantity: Math.max(1, config?.quantity - 1) },
                                            optionId
                                        )}
                                    >
                                        <Minus />
                                    </Button>
                                    <P className='rounded-2xl outline-air outline-1 w-10 text-center'>{config?.quantity}</P>
                                    <Button
                                        variant='link'
                                        size='xs'
                                        onClick={() => basket.updateProduct(
                                            product.id,
                                            { ...config, quantity: config?.quantity + 1 },
                                            optionId
                                        )}
                                    >
                                        <Plus />
                                    </Button>
                                </td>
                                <td className={cellClassName}>{formatCurrency(linePrice)}</td>
                                <th className={cellClassName}><RemoveFromBasketButton productId={productId} configId={optionId} /></th>
                            </tr>
                        )
                    })}
                </tbody>
                <tfoot className='font-bold'>
                    {/*<tr>
                        <td />
                        <td />
                        <td className={cn(cellClassName, 'text-right')}>Total</td>
                        <td className={cn(cellClassName)}>{formatCurrency(calculations.totalExTax)}</td>
                    </tr>*/}
                    {/*<tr>
                        <td />
                        <td />
                        <td className={cn(cellClassName, 'text-right')}>VAT</td>
                        <td className={cn(cellClassName)}>{formatCurrency(calculations?.totalPrice ?? 0)}</td>
                    </tr>*/}
                    <tr>
                        <td />
                        <td />
                        <td className={cn(cellClassName, 'bg-air text-white rounded-bl-md text-right')}>Total</td>
                        <td className={cn(cellClassName, 'bg-air text-white rounded-br-md underline decoration-double')}>{formatCurrency(calculations?.totalPrice ?? 0)}</td>
                    </tr>
                </tfoot>
            </table>
        ) :
            <Empty>
                <EmptyHeader>
                    <EmptyMedia>
                        <LucideClockFading />
                    </EmptyMedia>
                    <EmptyTitle>Loading basket...</EmptyTitle>
                </EmptyHeader>
            </Empty>
    }

    return <ContentLayout headerTitle='Your Basket'>
        {
            Object.keys(basket.order.products).length > 0
                ? <>
                    <BasketTable />
                    <P>All prices include VAT.</P>
                    <Button
                        className='w-full py-5'
                        size='lg'
                        onClick={goToCheckout}
                    >
                        Proceed to checkout<ArrowRightIcon />
                    </Button>
                </>
                : <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <ShoppingBasketIcon />
                        </EmptyMedia>
                        <EmptyTitle>Your basket is empty</EmptyTitle>
                        <EmptyDescription>
                            Visit the shop to find something to put in it!
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button variant="outline" size="sm" asChild>
                            <Link to="/shop">
                                Browse shop
                            </Link>
                        </Button>
                    </EmptyContent>
                </Empty>
        }
    </ContentLayout>
}


export async function loader({ params }: Route.LoaderArgs) {
    const productIdsToSlug = Object.fromEntries(
        (await products.getAll()).map(product => [product.id, product.slug])
    )

    return { productIdsToSlug }
}

export function RemoveFromBasketButton(props: {
    productId: string,
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
                            basket.removeProduct(props.productId, props.configId)
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
