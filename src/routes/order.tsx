import { ContentLayout } from '#src/components/app/BaseLayout.tsx'
import { InfoCard } from '#src/components/common/InfoCard.tsx'
import { Markdown } from '#src/components/common/Markdown.tsx'
import { H2, H4, H6, P } from '#src/components/common/typography.tsx'
import PostItem from '#src/components/posts/PostItem.tsx'
import { Button } from '#src/components/ui/button.tsx'
import { Skeleton } from '#src/components/ui/skeleton.tsx'
import { useBasket } from '#src/lib/basket.ts'
import type { Content } from '#src/lib/content.server.ts'
import { Product } from '#src/lib/products.server.ts'
import { SHOP } from '#src/shop.ts'
import { cn } from 'cn'
import { BookIcon, Check, Copy, FileDownIcon, MonitorCogIcon, Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { Route } from './+types/order'

export default function Order({ loaderData: { order, orderId }, params }: Route.ComponentProps) {
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const allFulfilled = order.products?.every(product => product.fulfillmentStatus !== 'pending')
        let timeout: ReturnType<typeof setTimeout>
        if (order.paid && !allFulfilled) {
            timeout = setTimeout(() => navigate(location.pathname + location.search), 10000)
        }
        () => clearTimeout(timeout)
    }, [order])

    const [searchParams] = useSearchParams()
    const success = searchParams.has('success')

    const basket = useBasket()
    useEffect(() => {
        if (success && basket.size()) {
            basket.clear();
        }
    }, [])

    const [orderIdCopied, setOrderIdCopied] = useState(false)
    const copyOrderIdToClipboard = () => {
        navigator.clipboard.writeText(orderId)
        setOrderIdCopied(true)
        setTimeout(() => setOrderIdCopied(false), 2000)
    };

    return <ContentLayout>
        {success && <>
            <div className="text-center py-10">
                <H2>Your order has been placed!</H2>
                <H6>Thank you for your custom ❤️</H6>

                <div className='flex gap-4 justify-between bg-accent/50 rounded-lg mt-10 p-2 items-center font-semibold text-lg'>
                    <p>Order ID</p>
                    <p className='p-2 rounded-lg outline grow font-mono'>{orderId}</p>
                    <Button variant='ghost' onClick={copyOrderIdToClipboard}>
                        {orderIdCopied ? <Check/> : <Copy/> }
                    </Button>
                </div>
            </div>
        </>}

        {!order.paid && <InfoCard>{{
            body: <P>
                This order has not been processed because no payment has been received.
                If you think this is an error, please get in touch.
            </P>
        }}</InfoCard>}

        <H2>Products</H2>
        <div className='flex flex-col gap-2'>
            {order.products?.map(product =>
                <div className='w-full bg-card shadow rounded-md p-2 flex flex-row gap-4'>
                    <div className='basis-1/3'>
                        {/* TODO: add option to load product with the purchased config */}
                        <ContentItem library='products' id={product.productId} />

                    </div>
                    <div className='flex flex-col gap-2 basis-1/3 grow'>
                        {Object.keys(product.options).length > 0 && <div>
                            <H4>Options:</H4>
                            {
                                Object
                                    .entries(product.options)
                                    .map(([key, valu]) =>
                                        <P><b className='capitalize'>{key}</b>: {value}</P>
                                    )
                            }
                        </div>}

                        {
                            product.fulfillmentStatus === 'fulfilled'
                                ? <div>
                                    <ContentInstructions id={ product.productId } />
                                    <H4>Files:</H4>
                                    {product.files.map(({ file, url }, index) => <div key={index} className={cn('flex flex-row gap-2 py-1', index % 2 === 0 && 'bg-accent/50')}>
                                        {file.tags.includes('rw_package')}
                                        <FileIconFromTags tags={file.tags}/>
                                        <a className='hover:underline' href={url} download>{file.label}</a>
                                    </div>)}
                                    <p className='text-sm pt-2'>
                                        <b>Please note: </b>Files are kept on our servers for 1 year after which they may become unavailable.
                                        Please make sure you download and keep your files safe.
                                    </p>
                                </div>
                                : product.fulfillmentStatus === 'failed'
                                    ? <InfoCard>{{
                                        body: <P>
                                            Something went wrong while processing your order.
                                        </P>
                                    }}</InfoCard>
                                    : <InfoCard>{{
                                        body: <P>
                                            Waiting for fulfillment to complete.
                                            This usually take a few minutes.
                                        </P>
                                    }}</InfoCard>

                        }

                    </div>


                </div>)}
        </div>
    </ContentLayout>

}

export function FileIconFromTags(props: { tags: string[] }) {
    return props.tags.includes('ts_package')
        ? <Package />
        : props.tags.includes('document')
            ? <BookIcon />
            : props.tags.includes('installer')
                ? <MonitorCogIcon/>
                : <FileDownIcon/>
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
    const orderId = new URL(request.url).searchParams.get('id')
    if (!orderId) throw new Error("Order ID required")

    const { data: order } = await SHOP.POST('/getOrder', { body: { orderId } })
    if (!order) throw new Error('Order not found')
    return { order, orderId }
}


function ContentItem(props: {
    library: string,
    id: string,
}) {
    const [content, setContent] = useState<Content>()

    useEffect(() => {
        fetch(`/api/content/${props.library}/${props.id}`)
            .then(res => res.json())
            .then(setContent)
    }, [props.id])

    return content
        ? <PostItem post={content} showImage />
        : <Skeleton className='w-full h-48' />
}

export function useContent(library: string, id: string) {
    const [content, setContent] = useState<Content>()

    useEffect(() => {
        fetch(`/api/content/${library}/${id}`)
            .then(res => res.json())
            .then(setContent)
    }, [id])

    return content
}

function ContentInstructions(props: { id: string }) {
    const content = useContent('products', props.id) as Product
    return <Markdown content={content?.postPurchaseInstructions ?? ''} />
}
