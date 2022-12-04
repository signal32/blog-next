import { useEffect, useState } from "react";
import {FaArrowRight} from 'react-icons/fa'

const Drawer = (props: {
    title: string | React.ReactNode,
    expanded?: boolean,
    children: React.ReactNode,
}) => {
    const [expanded, setExpanded] = useState(props.expanded || false);
    useEffect(() => setExpanded(props.expanded || false), [props.expanded]);
    return (
        <div className="w-full rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
            <div className="w-full p-2 flex justify-between rounded-lg shadow-lg bg-slate-100 dark:bg-slate-600" onClick={() => setExpanded(!expanded)}>
                <div>{props.title}</div>
                <p className={`transition-all align-middle ${expanded? 'rotate-90' : ''}`}><FaArrowRight/></p>
            </div>
            <div className={`w-full px-2 transition-all ${expanded? 'h-fit opacity-100' : 'h-0 opacity-0'}`}>
                {expanded && props?.children}
            </div>
        </div>
    )
}

export default Drawer