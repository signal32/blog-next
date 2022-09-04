import { useEffect } from "react";
import { LayoutRequestProps, useAppBaseLayoutParams } from "../components/layouts/AppBaseLayout";
import { NextPageWithLayout } from "./_app";

interface Props extends LayoutRequestProps {}

const Simulation: NextPageWithLayout<Props> = (props) => {
    useEffect(() => props.requestLayout({title: 'Simulation', image: 'https://images.pexels.com/photos/220201/pexels-photo-220201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'}));

    return (
        <div>
            <h1 className="text-lg">Simulation Products</h1>
        </div>
    )
}

Simulation.getLayout = useAppBaseLayoutParams();
export default Simulation;
