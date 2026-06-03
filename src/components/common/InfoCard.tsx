import { Info } from "lucide-react";
import { ReactElement } from "react";

export function InfoCard(props: {
    children: {
        body: ReactElement,
        footer?: ReactElement,
    }
}) {
    return (
        <div className="bg-air/10 p-2 rounded-lg">
            <div className="flex gap-3">
                <Info scale={10} className="basis-1/12" />
                {props.children.body}
            </div>

            <div className="flex gap-3 pt-2">
                {props.children.footer}
            </div>

        </div>
    )
}
