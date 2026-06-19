import { Calendar } from "lucide-react"

interface DateDisplayProps {
    date: string | Date, //TODO make this a strongly typed date object
}

const DateDisplay = (props: DateDisplayProps) => {
    return (
        <div className="dark:text-slate-400 text-slate-600 flex items-center gap-2">
            <h3><Calendar size={18} /></h3>
            <h3>{props.date instanceof Date ? props.date.toDateString() : props.date}</h3>
        </div>
    )
}

export default DateDisplay;
