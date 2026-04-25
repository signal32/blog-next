import { AddToCartButton, OnAddToBasketCb } from '#src/components/AddToCartButton';
import { H3 } from '#src/components/common/typography';
import { Button } from '#src/components/ui/button';
import { Skeleton } from '#src/components/ui/skeleton';
import { formatCurrency } from '#src/lib/utils';
import { SHOP } from '#src/shop';
import { ExternalLink, FileDown } from 'lucide-react';
import { ReactElement, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Config, ShopClient } from 'store';
import { ContentLayout } from "../../components/app/BaseLayout";
import Drawer from "../../components/common/Drawer";
import { Markdown } from '../../components/common/Markdown';
import { useModalStore } from "../../components/common/Modal";
import { type FileDetails, files } from "../../lib/file.server";
import { type Product, type Requirement, products } from "../../lib/products.server";
import { Route } from './+types/product';

export default function Product({ loaderData }: Route.ComponentProps) {

    return <ProductLayout product={loaderData.product}>{{
        main: <>
            <Markdown content={loaderData.product.description ?? ''} />

            <Drawer title="Requirements">
                {loaderData.product.requirements?.map((item, i) => <RequirementItem
                    key={i}
                    requirement={item}
                    products={loaderData.dependencyProducts ?? []}
                />)}
            </Drawer>
        </>,
        sidebar: <ProductSidebar product={loaderData.product} file={loaderData.mainFile} />
    }}</ProductLayout>
}

export async function loader({ params }: Route.LoaderArgs) {
    const product = await products.getBySlug(params['slug'] ?? '');
    if (!product) throw new Response(undefined, { status: 404 })

    // Fetch internal products for dependencies
    // TODO do this for children, parent & related products
    const dependencyProducts = await Promise.all(product?.requirements?.filter(item => item.type == 'internal')
        .map(async (item) => {
            if (item.type == 'internal') {
                const product = (await products.getBySlug(item.id));
                const file = product?.files?.primary ? await files.getBySlug(product?.files?.primary) : undefined;
                return { product, file }
            }
            else return {}
        }) || []);

    const mainFile = product?.files?.primary ? (await files.getBySlug(product.files.primary)) ?? undefined : undefined
    const otherFiles = product?.files?.other.map(item => ({
        file: files.getBySlug(item.slug),
        ...item,
    })) || []

    return {
        product,
        dependencyProducts,
        mainFile,
        otherFiles,
    }
}

export function ProductLayout(props: {
    product: Product,
    children: {
        main: ReactElement,
        sidebar: ReactElement,
    }
}) {
    return <ContentLayout
        headerTitle={props.product?.name}
        header={props.product?.media?.banner
            ? { type: 'image', href: props.product.media.banner }
            : undefined}
        breadcrumbs
    >
        <div>
            <div className="flex flex-wrap-reverse gap-5">
                <div className="grow basis-80">
                    {props.children.main}
                </div>
                <div className="grow basis-20">
                    {props.children.sidebar}
                </div>
            </div>
        </div>
    </ContentLayout>
}

export function ProductSidebar(props: {
    product: Product,
    config: Config,
    onAddToBasket?: OnAddToBasketCb,
    file?: FileDetails,
}) {

    const [price, setPrice] = useState<Awaited<ReturnType<ShopClient['productPrice']>>>()
    useEffect(() => {
        const { storeProduct } = props.product
        if (storeProduct) SHOP
            .productPrice({ productId: storeProduct.id })
            .then(setPrice)
    }, [])

    const modals = useModalStore();
    const openGallery = (img: string) => {
        modals.pushModal(
            <div className="h-full">
                <img
                    src={img}
                    alt='product image'
                    sizes="100vw"
                    style={{
                        objectFit: "contain"
                    }} />
            </div>
        )
    }

    return <>
        <div className='p-2 rounded-lg shadow-lg bg-slate-200 dark:bg-slate-800'>
            <div className="flex gap-3 flex-wrap">
                {props.product.media?.gallery?.map((item, i) => (
                    <div
                        key={i}
                        className="flex-auto w-24 h-24 rounded-lg shadow-md bg-cover hover:shadow-xl hover:scale-105 transition-transform"
                        style={{ backgroundImage: `url(${item})` }}
                        onClick={() => openGallery(item)}>
                    </div>
                ))}
            </div>
            <ProductDetails product={props.product} />

            {props.file &&
                <>
                    <Button asChild className='w-full'>
                        <a href={props.file.href} target='_blank'>
                            <FileDown />
                            Download
                        </a>
                    </Button>
                    <p className="italic text-sm text-right">{props.file.fileName}</p>
                </>
            }

            {props.product.storeProduct &&
                <>
                    {price?.price ? <H3>{formatCurrency(price?.price)}</H3> : <Skeleton className="h-12 mb-2 w-full" />}
                    <AddToCartButton product={props.product} config={props.config} onAddToBasket={props.onAddToBasket} />
                </>
            }
        </div>
    </>
}

const ProductDetails = (props: { product: Product }) => {
    const details = [
        { name: 'Published', value: props.product.published?.toDateString() },
        { name: 'Product ID', value: props.product.id },
        { name: 'Product name', value: props.product.name },
        { name: 'Has requirements', value: !props.product.requirements == undefined }
    ];
    return (
        <div>
            {details.map((detail, i) => detail.value ? (
                <div key={i} className="flex gap-2 font-extralight">
                    <div className="flex-auto text-left">{detail.name}</div>
                    <div className="flex-auto text-right">{detail.value}</div>
                </div>
            ) : '')}
        </div>
    )
}

const RequirementItem = (props: { requirement: Requirement, products: { product?: Product, file?: FileDetails }[] }) => (
    <div className="flex justify-between gap-2 p-2 my-2 rounded shadow bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors">
        {props.requirement.type == 'internal' && [
            <div key={1}>{props.products.find((p) => p.product?.id === props.requirement.id)?.product?.name}</div>,
            <div key={2} className="flex items-center gap-2"> </div>,
            <div key={3} className="flex items-center gap-2">
                <div key={2} className="flex items-center gap-2">
                    <Button asChild variant={'link'} className='cursor-pointer'>
                        <Link to={'/product/' + props.requirement.id}>Details</Link>
                    </Button>
                </div>
                <Button asChild variant={'outline'} className='cursor-pointer'>
                    <a href={props.products.find((p) => p.product?.id === props.requirement.id)?.file?.href} target='_blank'>
                        <FileDown />
                        Download
                    </a>
                </Button>
            </div>
        ]}
        {
            props.requirement.type == 'external' && [
                <div key={1} className="">{props.requirement.id}</div>,
                <div key={2} className="flex items-center gap-2">
                    <Button asChild variant={'outline'} className='text-xs'>
                        <a
                            href={props.requirement.href[0]} target="_blank">
                            <ExternalLink />
                            {props.requirement.site ?? new URL(props.requirement.href[0]).hostname}
                        </a>
                    </Button>
                </div>
            ]
        }
    </div >
)
