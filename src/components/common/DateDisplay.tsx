import { FaCalendar } from "react-icons/fa"

interface DateDisplayProps {
    date: string | Date, //TODO make this a strongly typed date object
}

const DateDisplay = (props: DateDisplayProps) => {
    return (
        <div className="dark:text-slate-400 text-slate-600">
            <h3 className="inline-block pr-3"><FaCalendar /></h3>
            <h3 className="inline-block">{ props.date instanceof Date ? props.date.toLocaleDateString() : props.date}</h3>
        </div>
    )
}

export default DateDisplay;