import { clsx, type ClassValue } from "clsx"
import { useEffect, useRef } from "react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


export function useSyncedRef<T>(value: T) {
    const ref = useRef(value)
    useEffect(() => {
        ref.current = value
    }, [value])
    return ref
}

export function formatCurrency(amount: number) {
    return `£${(amount / 100).toFixed(2)}`
}

export function once<T>(fn: () => T): () => T {
    let called = false;
    let result: T;

    return () => {
        if (!called) {
            called = true;
            result = fn();
        }
        return result;
    };
}

export function debounce<Args extends unknown[], X>(
    fn: (...args: Args) => X,
    delay: number
): (...args: Args) => Promise<Awaited<X>> {
    let timer: ReturnType<typeof setTimeout>

    return (...args) => {
        return new Promise((resolve) => {
            if (timer !== undefined) {
                clearTimeout(timer)
            }

            timer = setTimeout(async () => {
                resolve(await fn(...args))
            }, delay)
        })
    }
}

export function env(name: string) {
    if (typeof window !== 'undefined') {
        return import.meta.env[name]
    }
    else {
        //@ts-expect-error
        process.loadEnvFile()
        return process.env[name]
    }
}
