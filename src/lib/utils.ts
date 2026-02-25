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
