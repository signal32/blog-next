import { posts } from "./posts.server";
import { products } from "./products.server";

async function preRenderData() {
    const allPosts = await posts.getAllDetailed()
    const allProducts = await products.getAllDetailed()

    return { allPosts, allProducts }
}

export const preRenderCache = once(preRenderData)
export type PreRenderCache = Awaited<ReturnType<typeof preRenderData>>

function once<T>(fn: () => T): () => T {
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
