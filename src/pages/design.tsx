import { LayoutRequestProps, defineLayout } from "../components/app/BaseLayout";
import { PageWithLayout } from '../components/app/LayoutApp';
import designHeader from "../resources/images/design_header.jpg";

interface Props extends LayoutRequestProps {}

const Simulation: PageWithLayout<Props> = (props) => {
    
    return (
        <div>
            <h1 className="text-lg">Simulation Products</h1>
        </div>
    )
}

Simulation.layout = defineLayout({
    headerTitle: 'Web Design',
    headerImage:  designHeader.src,
})

export default Simulation;
