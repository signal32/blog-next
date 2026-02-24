import { ArrowRightIcon, LucideClockFading, Minus, Plus, ShoppingBasketIcon, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ContentLayout } from 'src/components/app/BaseLayout'
import { Button } from 'src/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from 'src/components/ui/empty'
import { useBasket } from 'src/lib/basket'
import { products } from 'src/lib/products.server'
import { cn, formatCurrency, } from 'src/lib/utils'
import { SHOP } from 'src/shop'
import { getOrderOption, ShopClient } from 'store'
import { Route } from './+types/basket'

export default function Basket({ loaderData }: Route.ComponentProps) {
    const basket = useBasket()

    const goToCheckout = async () => {
        const { url } = await SHOP.createStripePayment({ order: basket.order })
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
                        const { product, option } = getOrderOption(basket.order, productId, optionId)

                        return (
                            <tr key={i}>
                                <td className={cellClassName}><Link to={`/product/${loaderData.productIdsToSlug[product.id]}`} className='hover:underline'>{product.name}</Link></td>
                                <td className={cellClassName}>{formatCurrency(unitPrice)}</td>
                                <td className={cellClassName}>
                                    <Button
                                        variant='link'
                                        onClick={() => basket.updateProduct(
                                            product.id,
                                            { ...option, quantity: Math.max(1, option?.quantity - 1) },
                                            optionId
                                        )}
                                    >
                                        <Minus />
                                    </Button>
                                    {option?.quantity}
                                    <Button
                                        variant='link'
                                        onClick={() => basket.updateProduct(
                                            product.id,
                                            { ...option, quantity: option?.quantity + 1 },
                                            optionId
                                        )}
                                    >
                                        <Plus />
                                    </Button>
                                </td>
                                <td className={cellClassName}>{formatCurrency(linePrice)}</td>
                                <th className={cellClassName}><Button variant='link' onClick={() => basket.removeProduct(product.id)}><Trash /></Button></th>
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
                        <td className={cn(cellClassName, 'bg-air text-white rounded-l-md text-right')}>Total (incl. VAT)</td>
                        <td className={cn(cellClassName, 'bg-air text-white rounded-r-md')}>{formatCurrency(calculations?.totalPrice ?? 0)}</td>
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

    return <ContentLayout>
        {
            Object.keys(basket.order.products).length > 0
                ? <>
                    <BasketTable />
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
