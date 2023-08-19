import { useEffect } from "react";
import AppBaseLayout, { LayoutRequestProps, defineLayout } from "../components/app/BaseLayout";
import { PageWithLayout } from '../components/app/LayoutApp';
import simulationHeader from '../resources/images/simulation_header.jpg';
import Button from "../components/common/Button";
import Link from "next/link";
import { GetStaticProps } from 'next';
import { Product, products } from '../lib/products';
import PostItem from '../components/posts/PostItem';

const TEXT = [
    'I develop Train Simulator add-ons in my spare time with a focus on realism and authenticity.',
    'These projects are inspired by my local surroundings that are now void of their industrial past and aim to reproduce a forgotten time.',
    '',
    'I am also available to take on freelance 3D modelling work for Train Simulator'
]

const CONTENT = [
    {
        title: 'High quality railway simulation products',
        text: [
            'I develop Train Simulator add-ons in my spare time with a focus on realism and authenticity.',
            'These projects are inspired by my local surroundings that are now void of their industrial past and aim to reproduce a forgotten time.',
        ]
    },
    {
        title: 'Freelance work',
        text: [
            'I am also available to take on freelance 3D modelling work for Train Simulator'
        ]
    }
]

interface Props {
    products: Product[]
}

const Simulation: PageWithLayout<Props> = (props) => {

    return (
        <div>

            {
                CONTENT.map((item, idx) => (
                    <div key={idx} className=' pb-5'>
                        <h3 className="text-xl">{item.title}</h3>
                        {item.text.map((line, i) => <p key={i}>{line}</p>)}
                    </div>
                ))
            }

            {/* Product items grid */}
            <h3 className="text-xl">Releases</h3>
            <div className="flex flex-auto gap-3 flex-row my-5">
                {props.products.map((product, i) => (
                    <PostItem 
                        post={product}
                        key={i}
                    />
                ))}
            </div>
        </div>
    );
}

Simulation.layout = defineLayout({
    headerTitle: 'Railway Simulation',
    header: {
        type: 'image',
        href: '/graphics/posts/dava/aviemore_box_shed.jpg'
    }
})

export default Simulation;

export const getStaticProps: GetStaticProps<Props> = async () => {
    const pageProducts = []

    const speysideLineProduct = await products.getBySlug('speyside_line')
    if (speysideLineProduct) pageProducts.push(speysideLineProduct)

    return { props: { products: pageProducts } }
}
