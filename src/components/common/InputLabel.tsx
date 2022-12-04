import React from "react";

const labelColor = 'text-black dark:text-white ';
const labelLayout = 'p-1';
const labelClass = [labelColor, labelLayout].join(' ');

const InputLabel = (props: {
    text: string,
    children?: React.ReactNode,
    input?: React.ReactNode,
}) => (
    <div>
        <div className={labelClass}>
            {props.text}
        </div>
        <div className='flex gap-4'>
            {props.input || props.children}
        </div>
    </div>
)

export default InputLabel;