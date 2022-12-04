import { useEffect } from "react";
import { LayoutRequestProps, defineAppBaseLayoutParams } from "../components/layouts/AppBaseLayout";
import { NextPageWithLayout } from "./_app";
import designHeader from "../resources/images/design_header.jpg";

interface Props extends LayoutRequestProps {}

const Simulation: NextPageWithLayout<Props> = (props) => {
    useEffect(() => props.requestLayout({title: 'Web Design', image: designHeader.src}));

    return (
        <div>
            <h1 className="text-lg">Simulation Products</h1>
        </div>
    )
}

Simulation.getLayout = defineAppBaseLayoutParams();
export default Simulation;
