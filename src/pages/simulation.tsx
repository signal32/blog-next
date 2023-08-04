import { useEffect } from "react";
import AppBaseLayout, { LayoutRequestProps, defineAppBaseLayoutParams } from "../components/app/BaseLayout";
import { PageWithLayout } from '../components/app/LayoutApp';
import simulationHeader from '../resources/images/simulation_header.jpg';
import Button from "../components/common/Button";
import Link from "next/link";

const TEXT = [
    'Rails Developments are developers of Train Simulation add-ons. Our add-ons for Dovetail Games Train Simulator focus on providing exceptional realism.',
    'We are also working towards developing a range of exciting new simulation technologies.',
    'For all the latest news, visit our blog or like us on Facebook.',
]

const PRODUCTS = [
    'product1', 'product2', 'product3',
]

interface Props extends LayoutRequestProps {}

const Simulation: PageWithLayout<Props> = (props) => {
    useEffect(() => props.updateLayout({title: 'Simulation', image: simulationHeader.src}));

    return (
        <div>
            <h1 className="text-lg">Simulation Products</h1>
            {/* Text container */}
            <div className="w-full p-2 rounded-lg shadow-md bg-slate-400 dark:bg-slate-800">
                <h3 className="text-xl">Title</h3>
                {TEXT.map((line, i) => <p key={i}>{line}</p>)}
            </div>

            {/* Product items grid */}
            <div className="flex flex-auto gap-3 flex-row my-5">
                {PRODUCTS.map((product, i) => (
                    <Link key={i} href="/product/speyside_line" 
                        className="basis-1/2 h-48 bg-slate-700 rounded-lg shadow-md overflow-hidden" 
                        style={{backgroundImage: `url(${simulationHeader.src})`}}>
                        
                        <div className="w-full h-full p-2 opacity-0 hover:opacity-100 transition backdrop-blur-sm" style={{background: 'rgba(0,0,0,0.3)'}}>
                            {product}
                            {/* <Button text="See more..." href="/"/> */}
                        </div>

                    </Link>
                ))}
            </div>

            {/* Freelance text container */}
            <div className="w-full p-2 rounded-lg shadow-md bg-slate-400 dark:bg-slate-800">
                <h3 className="text-xl">Freelance Title</h3>
                {TEXT.map((line, i) => <p key={i}>{line}</p>)}
            </div>
        </div>
    )
}

Simulation.layout = (page) => (
    <AppBaseLayout 
        headerImage={simulationHeader.src} 
        headerTitle="Simulation">
        {page}
    </AppBaseLayout>
)
export default Simulation;
