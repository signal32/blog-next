import { Minus, Plus, ShoppingBasketIcon, Trash } from 'lucide-react'
import { Link } from 'react-router'
import { ContentLayout } from 'src/components/app/BaseLayout'
import { Button } from 'src/components/ui/button'
import { Basket, useBasket } from 'src/lib/basket'
import { cn } from 'src/lib/utils'
import { Route } from './+types/basket'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from 'src/components/ui/empty'


export default function Basket({ }: Route.ComponentProps) {
    const basket = useBasket()

    return <ContentLayout>

        {
            basket.products.size > 0
                ? <>
                    <BasketTable basket={basket} />
                    <Button className='w-full' size='lg'>Proceed to checkout</Button>
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



function BasketTable(props: { basket: Basket }) {
    const cellClassName = 'p-2'

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
                {props.basket.products.values().map(({ product, details }, i) => (
                    <tr>
                        <td className={cellClassName}><Link to={`/product/${product.slug}`} className='hover:underline'>{product.name}</Link></td>
                        <td className={cellClassName}>{product.purchase?.price}</td>
                        <td className={cellClassName}>
                            <Button variant='link' onClick={() => props.basket.updateProduct(product, { ...details, qty: Math.max(1, details.qty - 1) })}><Minus /></Button>
                            {details.qty}
                            <Button variant='link' onClick={() => props.basket.updateProduct(product, { ...details, qty: details.qty + 1 })}><Plus /></Button>
                        </td>
                        <td className={cellClassName}>{((product.purchase?.price ?? 0) * details.qty).toFixed(2)}</td>
                        <th className={cellClassName}><Button variant='link' onClick={() => props.basket.removeProduct(product)}><Trash /></Button></th>

                    </tr>
                ))}
            </tbody>
            <tfoot className='font-bold'>
                <tr>
                    <td />
                    <td />
                    <td className={cn(cellClassName, 'bg-air/50 rounded-l-lg text-center')}>Total:</td>
                    <td className={cn(cellClassName, 'bg-air/50 rounded-r-lg')}>{props.basket.products.values().reduce((prev, { product, details }) => prev + (product.purchase?.price ?? 0) * details.qty, 0).toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
    )
}
