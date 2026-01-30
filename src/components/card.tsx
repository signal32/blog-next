import { ReactElement } from "react"

export function Card(props: {
    children: {
        content: ReactElement,
        footer?: ReactElement,
    }
}) {
    return <div className="h-full w-full dark:bg-gray-800 bg-gray-200 rounded-xl shadow-lg flex flex-col justify-between">
        <div className="px-1 pt-0 pb-1 max-h-80 overflow-clip">
            {props.children.content}
        </div>

        {props.children.footer &&
            <div className="m-1 bottom-0 left-0">
                {props.children.footer}
            </div>
        }
    </div>
}
