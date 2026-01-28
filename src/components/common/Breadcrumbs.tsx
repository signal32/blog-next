import { Link } from "react-router";
import { FaHome } from "react-icons/fa";
import { useNavigation } from "react-router";

const Breadcrumbs = () => {
    const router = useNavigation();
    const breadcrumbs = (router.location?.pathname ?? '')
        .split(/\/(?!$)/)
        .map((element, i, arr) => ({ name: element, href: arr.slice(0, i + 1).join('/') }));

    return (
        <div className="flex flex-row">
            {
                breadcrumbs.map((breadcrumb, i) => {
                    return (
                        <div className="flex slate-800 dark:text-white" key={i}>
                            <div className="dark:text-white text-sm hover:bg-slate-200 dark:hover:bg-slate-800 hover:underline rounded flex p-1 capitalize transition-all">
                                {/*<Link to={breadcrumb.href || '/'}>{i == 0 ? (<a className="mt-auto mb-auto"><FaHome /></a>) : breadcrumb.name}</Link>*/}
                            </div>
                            {
                                (i < breadcrumbs.length - 1) && <a className="mt-auto mb-auto text-xs px-2">{'>'}</a>
                            }
                        </div>
                    );
                })
            }
        </div>
    );
}

export default Breadcrumbs;
