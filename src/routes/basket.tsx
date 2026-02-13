import { ArrowRightIcon, Minus, Plus, ShoppingBasketIcon, Trash } from 'lucide-react'
import { Link } from 'react-router'
import { ContentLayout } from 'src/components/app/BaseLayout'
import { Button } from 'src/components/ui/button'
import { Basket, useBasket } from 'src/lib/basket'
import { cn } from 'src/lib/utils'
import { Route } from './+types/basket'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from 'src/components/ui/empty'
import { useMemo } from 'react'

export default function Basket({ }: Route.ComponentProps) {
    const basket = useBasket()

    return <ContentLayout>
        {
            Object.keys(basket.products).length > 0
                ? <>
                    <BasketTable />
                    <Button className='w-full py-5' size='lg'>Proceed to checkout<ArrowRightIcon /></Button>
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

function formatCurrency(amount: number) {
    return `£${amount.toFixed(2)}`
}

function BasketTable() {
    const cellClassName = 'p-1'
    const basket = useBasket()

    const calculations = useMemo(() => {
        const lineItems = Object.values(basket.products).map(({ product, details }) => ({
            product,
            details,
            total: (product.purchase?.price ?? 0) * details.qty
        }))
        const totalExTax = lineItems.reduce((prev, { total }) => prev + total, 0)
        const totalTax = (totalExTax / 100) * 20
        const totalIncTax = totalExTax + totalTax

        return {
            lineItems,
            totalExTax,
            totalTax,
            totalIncTax
        }
    }, [basket])

    return (
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
                {calculations.lineItems.map(({ product, details, total }, i) => (
                    <tr key={i}>
                        <td className={cellClassName}><Link to={`/product/${product.slug}`} className='hover:underline'>{product.name}</Link></td>
                        <td className={cellClassName}>{formatCurrency(product.purchase?.price ?? 0)}</td>
                        <td className={cellClassName}>
                            <Button variant='link' onClick={() => basket.updateProduct(product, { ...details, qty: Math.max(1, details.qty - 1) })}><Minus /></Button>
                            {details.qty}
                            <Button variant='link' onClick={() => basket.updateProduct(product, { ...details, qty: details.qty + 1 })}><Plus /></Button>
                        </td>
                        <td className={cellClassName}>{formatCurrency(total)}</td>
                        <th className={cellClassName}><Button variant='link' onClick={() => basket.removeProduct(product)}><Trash /></Button></th>
                    </tr>
                ))}
            </tbody>
            <tfoot className='font-bold'>
                <tr>
                    <td />
                    <td />
                    <td className={cn(cellClassName, 'text-right')}>Total</td>
                    <td className={cn(cellClassName)}>{formatCurrency(calculations.totalExTax)}</td>
                </tr>
                <tr>
                    <td />
                    <td />
                    <td className={cn(cellClassName, 'text-right')}>VAT</td>
                    <td className={cn(cellClassName)}>{formatCurrency(calculations.totalTax)}</td>
                </tr>
                <tr>
                    <td />
                    <td />
                    <td className={cn(cellClassName, 'bg-air text-white rounded-l-md text-right')}>Total (incl. VAT)</td>
                    <td className={cn(cellClassName, 'bg-air text-white rounded-r-md')}>{formatCurrency(calculations.totalIncTax)}</td>
                </tr>
            </tfoot>
        </table>
    )
}
