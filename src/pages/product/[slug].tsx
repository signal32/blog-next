import Drawer from "../../components/common/Drawer";
import AppBaseLayout, { LayoutRequestProps, defineAppBaseLayoutParams } from "../../components/layouts/AppBaseLayout";
import markdownToHtml from "../../lib/markdown";
import { Product, products, Requirement } from "../../lib/products";
import { NextPageWithLayout, useAppStore } from "../_app";
import {FaDownload, FaExternalLinkAlt, FaInfoCircle} from 'react-icons/fa';
import Button from "../../components/common/Button";
import { useEffect } from "react";
import Link from "next/link";
import { CACHE } from "../../lib/content";
import { FileDetails, files } from "../../lib/file";
import { useModalStore } from "../../components/common/Modal";
import Image from "next/image";


interface ProductPageProps extends LayoutRequestProps {
    product: Product,
    productDescriptionHtml: string,
    dependencyProducts: {product: Product, file: FileDetails}[],
    mainFile: FileDetails,
    otherFiles: {slug: string, label: string, file: FileDetails}[],
}

const ProductPage: NextPageWithLayout<ProductPageProps> = (props) => {
    const modals = useModalStore();

    const openGallery = (img: string) => {
        modals.pushModal(
        <div className=" h-full">
            <Image src={img} layout="fill" objectFit="contain" onLoadingComplete={(e) => console.log(e)}/>
        </div>
        )
    }

    return (
        <div>
            <h1>Product: {props.product.name}</h1>
            <div className="flex gap-3">

                {/* Main content */}
                <div className="flex-auto w-80 p-2">
                    <div
                        className="text-slate-200 hame-markdown" 
                        dangerouslySetInnerHTML={{__html: props.productDescriptionHtml || ''}} 
                    />

                    <Drawer title="Requirements">
                        {props.product.requirements?.map((item, i) => <RequirementItem key={i} requirement={item} products={props.dependencyProducts} />)}
                    </Drawer>
                </div>

                {/* Sidebar */}
                <div className="flex-auto w-24 p-2 rounded-lg shadow-lg bg-slate-200 dark:bg-slate-800">
                    {/* TODO images */}
                    <div className="flex gap-3 flex-wrap">
                        {props.product.media?.gallery?.map((item, i) => (
                            <div key={i} className="flex-auto w-24 h-24 rounded-lg shadow-md bg-cover hover:shadow-xl hover:scale-105 transition-transform" style={{backgroundImage: `url(${item})`}} onClick={() => openGallery(item)}></div>
                        ))}
                    </div>
                    {/* TODO basic info */}
                    <ProductDetails product={props.product}/>
                    {/* TODO download links */}
                    <Button text="Download" icon={<FaInfoCircle/>} href={props.mainFile?.href}/>
                    <p className="italic text-sm text-right">{props.mainFile?.fileName}</p>
                    <p className="italic text-sm text-right">Details: {JSON.stringify(props.mainFile)}</p>
                </div>
            </div>
        </div>
    )
}

//ProductPage.getLayout = useAppBaseLayoutParams();
ProductPage.getLayout =  (page, props) => (
    <AppBaseLayout 
        defaultHeaderTitle={props.product.name}
        defaultHeaderImage={props.product.media?.banner}
        >
        {page}
    </AppBaseLayout>)
export default ProductPage;

type Params = {
    params: { slug: string }
}

export async function getStaticProps({params}: Params) {
    const product = await products.getBySlug(params.slug);
    const productDescriptionHtml = await markdownToHtml(product?.description || '');

    // Fetch internal products for dependencies
    // TODO do this for children, parent & related products
    const dependencyProducts = await Promise.all(product?.requirements?.filter(item => item.type == 'internal')
        .map( async (item) => {
            if (item.type == 'internal') {
                const product = await products.getBySlug(item.id) || null;
                const file = product?.files?.primary ? await files.getBySlug(product?.files?.primary) : null;
                return {product, file} 
            }
        }) || []);

    const mainFile = product?.files?.primary ?  await files.getBySlug(product.files.primary) ?? null : null
    const otherFiles = product?.files?.other.map(item => ({
        file: files.getBySlug(item.slug),
        ...item,
    })) || []

    return {
        props: { 
            product, 
            productDescriptionHtml, 
            dependencyProducts,
            mainFile,
            otherFiles,
        }
    }
}

export async function getStaticPaths() {
    const paths = products.getAll().map(product => ({
        params: {slug: product.slug}
    }));

    return {
        paths,
        fallback: false,
    }
}

const ProductDetails = (props: {product: Product}) => {
    const details = [
        {name: 'Published', value: props.product.published?.toDateString()},
        {name: 'Product ID', value: props.product.id},
        {name: 'Product name', value: props.product.name},
        {name: 'Has requirements', value: !props.product.requirements == undefined}
    ];
    return (
        <div>
            { details.map((detail, i) => detail.value? (
                <div key={i} className="flex gap-2 font-extralight">
                    <div className="flex-auto text-left">{detail.name}</div>
                    <div className="flex-auto text-right">{detail.value}</div>
                </div>
            ) : '')}
        </div>
    )
}

const RequirementItem = (props: {requirement: Requirement, products: {product:Product, file: FileDetails}[]}) => (
    <div className="flex justify-between gap-2 p-2 my-2 rounded shadow bg-slate-600 hover:bg-slate-500 transition-colors">
        { props.requirement.type == 'internal' && [
            <div key={1}>{props.products.find((p) => p.product.id = props.requirement.id)?.product.name}</div>,
            <div key={2} className="flex items-center gap-2"> <Link href={'/product/' + props.requirement.id}>Details</Link></div>,
            <div key={3} className="flex items-center gap-2">
                <Button text="Download" size="small" style="text" icon={<FaDownload/>} href={props.products.find((p) => p.product.id = props.requirement.id)?.file?.href}/>
            </div>
        ]}
        { props.requirement.type == 'external' && [
            <div key={1} className="">{props.requirement.id}</div>,
            <div key={2} className="flex items-center gap-2">
                <p className="text-xs px-2 rounded-full bg-amber-600">third party</p>
                <Button text={props.requirement.site} size="small" style="text" icon={<FaExternalLinkAlt />} href={props.requirement.href[0]} target="_blank" rel="noreferrer"/>
            </div>
        ]}
    </div>
)