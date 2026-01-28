import { Button } from "src/components/ui/button";
import { ContentLayout } from "../../components/app/BaseLayout";
import PostList from "../../components/posts/PostList";
import { getAllPosts } from "../../lib/posts";
import { Route } from "./+types/index";
import { Link } from "react-router";

export default function ({ loaderData }: Route.ComponentProps) {
    return <ContentLayout>
        <div className="text-white">
            <PostList posts={loaderData.posts} />
            <Button asChild>
                <Link to={'/'}>Older posts</Link>
            </Button>
        </div>
    </ContentLayout>
}

export async function loader() {
    const posts = await getAllPosts();
    return { posts }
}
