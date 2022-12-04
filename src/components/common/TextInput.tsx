import React, { ChangeEventHandler, FormEventHandler } from "react";

const inputLayout = 'w-full p-1 px-2 z-10 outline outline-1 rounded-md shadow transition-all focus:outline-2 focus:shadow-md ';
const colorStyle = 'text-black bg-gray-100 dark:bg-slate-900 dark:focus:bg-slate-800 dark:text-slate-100 '

type Status = 'success' | 'information' | 'warning' | 'danger';

// const getStatusColor = (status: Status, targets = ['outline', 'bg',], lightTargets = ['text']) => {
//     const targetClasses = (colorKey: string) => [
//         ...targets.map(target => `${target}-${colorKey}-200 dark:${target}-${colorKey}-700`),
//         ...lightTargets.map(target => `${target}-${colorKey}-700 dark:${target}-${colorKey}-200`)
//     ].join(' ');

//     switch (status) {
//         case 'success': return targetClasses('green')
//         case 'information': return targetClasses('blue');
//         case 'warning': return targetClasses('yellow');
//         case 'danger': return targetClasses('red');
//         default: return targetClasses('gray');
//     }
// }

const getStatusColor = (status: Status, bg = true, text = true, outline = true) => {
    switch (status) {
        case 'success': return `${bg? 'bg-green-200 dark:bg-green-700' : ''} ${text? 'text-green-700 dark:text-green-200' : ''} ${outline? 'outline-green-200 dark:outline-green-700' : ''}`;
        case 'information': return `${bg? 'bg-blue-200 dark:bg-blue-700' : ''} ${text? 'text-blue-700 dark:text-blue-200' : ''} ${outline? 'outline-blue-200 dark:outline-blue-700' : ''}`;
        case 'warning': return `${bg? 'bg-yellow-200 dark:bg-yellow-700' : ''} ${text? 'text-yellow-700 dark:text-yellow-200' : ''} ${outline? 'outline-yellow-200 dark:outline-yellow-700' : ''}`;
        case 'danger': return `${bg? 'bg-red-200 dark:bg-red-700' : ''} ${text? 'text-red-700 dark:text-red-200' : ''} ${outline? 'outline-red-200 dark:outline-red-700' : ''}`;
        default: return `${bg? 'bg-slate-200 dark:bg-slate-700' : ''} ${text? 'text-slate-700 dark:text-slate-200' : ''} ${outline? 'outline-slate-200 dark:outline-slate-700' : ''}`
    }
}

const TextInput = (props: {
    value?: string
    placeholder?: string
    feedback?: {message?: string, status?: Status, custom?: React.ReactElement}
    onChange?: ChangeEventHandler<HTMLInputElement>
    onInput?: FormEventHandler<HTMLInputElement>
}) => (
    <div className='w-full'>
        <input 
            className={inputLayout + colorStyle + ' ' + (props.feedback ? getStatusColor(props.feedback?.status || 'information', false) : 'outline-air')}
            placeholder={props.placeholder}
            value={props.value}
            onChange={props.onChange}
            onInput={props.onInput}
        />
        <div className={`w-full p-2 -mt-2 -z-10 rounded-md shadow transition-opacity ${getStatusColor(props.feedback?.status || 'information')} ${props.feedback? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
            {props?.feedback?.message || props?.feedback?.custom}
        </div>
    </div>
)

export default TextInput;