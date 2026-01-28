import { ContentLayout } from "../../components/app/BaseLayout";
import Button from "../../components/common/Button";
import PostList from "../../components/posts/PostList";
import { getAllPosts } from "../../lib/posts";
import { Route } from "./+types/index";

export default function ({ loaderData }: Route.ComponentProps) {
    return <ContentLayout>
        <div className="text-white">
            <PostList posts={loaderData.posts} />
            <Button text="Older posts" href="/" />
        </div>
    </ContentLayout>
}

export async function loader() {
    const posts = await getAllPosts();
    return { posts }
}
