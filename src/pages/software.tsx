import { LayoutRequestProps, defineLayout } from "../components/app/BaseLayout";
import { PageWithLayout } from '../components/app/LayoutApp';
import designHeader from "../resources/images/design_header.jpg";

interface Props extends LayoutRequestProps {}
const Software: PageWithLayout<Props> = (props) => {
    
    return (
        <div>
            <h1 className="text-lg">Software Developer</h1>

            <div className='flex flex-row'>

                {/* Left col */}
                <div className='hame-markdown'>
                    <p>I am an experienced software developer with particular expertise in web technologies and interactive media.</p>
                    <h3>Skill set</h3>
                    <ul>
                        <li>
                            <p>Web (JavaScript, CSS, HTML)</p>
                            <ul>
                                <li>Static sites with Zola and TailWindCSS</li>
                                <li>Progressive Web Apps with VueJS, Ionic, and TypeScript</li>
                                <li>Unit tests with Jest</li>
                            </ul>
                        </li>
                        <li>
                            <p>Python</p>
                            <ul>
                                <li>Data analysis with Numpy, Pandas, SciKit, and Matplotlib</li>
                            </ul>
                        </li>
                        <li>
                            <p>Java (8+)	</p>
                            <ul>
                                <li>Backend web services with Spring Boot, Data, and Security</li>
                                <li>Game engine programming with LWJGL and BGFX</li>
                                <li>Unit tests with Junit</li>
                            </ul>
                        </li>
                        <li>
                            <p>SQL	</p>
                            <ul>
                                <li>Providing persistence for backend web services with MySQL</li>
                            </ul>
                        </li>
                        <li>
                            <p>Git	</p>
                            <ul>
                                <li>With CI using GitHub Actions</li>
                            </ul>
                        </li>
                        <li>
                            <p>Linux</p>
                            <ul>
                                <li>Web service deployment with Docker and NGINX</li>
                            </ul>
                        </li>
                        <li>
                            <p>Photoshop + Affinity Photo/Designer</p>
                            <ul>
                                <li>Graphic design</li>
                                <li>Texture authoring for 3D games</li>
                            </ul>
                        </li>
                        <li>
                            <p>Blender</p>
                            <ul>
                                <li>Architectural 3D modelling for games</li>
                            </ul>
                        </li>
                    </ul>
                </div>

                {/* Right col */}
                <div>
                    <h2>Recent projects</h2>
                </div>
            </div>

        </div>
    )
}

Software.layout = defineLayout({
    headerTitle: 'Web Design',
    header:  {
        type: 'image',
        href: designHeader.src,
    },
})

export default Software;
