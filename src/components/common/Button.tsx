import Link from "next/link"

interface ButtonProps {
    text: string,
    href: string,
}

const Button = (props: ButtonProps) => {
    return (
        <Link href={props.href}>
            <div className="py-2 px-4 my-2 w-full bg-ocean text-white rounded-lg shadow-md hover:bg-air focus:outline-none focus:ring-2 focus:ring-paua focus:ring-opacity-75">
                <a>{props.text}</a>
            </div>
        </Link>
    )
}

export default Button;