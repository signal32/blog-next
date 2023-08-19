import { Post } from "../../lib/posts";
import PostItem from "./PostItem";
import styles from './styles/postList.module.scss'

export interface PostListProps {
    posts: Post[],
}

const PostList = (props: PostListProps) => {
    return (
        <div>
            <HorizontalScrollList>
            {
                    props.posts.map((item, i) => {
                        return (
                            <div key={i} className=' w-72 flex-shrink-0'>
                                <PostItem post={item} />
                            </div>
                        )
                    })
                }
            </HorizontalScrollList>
            {/* <div className={styles.postListContainer}>
           {
                    props.posts.map((item, i) => {
                        return (
                            <div key={i} className=' w-80'>
                                <PostItem post={item} />
                            </div>
                        )
                    })
                }
            </div> */}

        </div>
    )
}

export default PostList;

// import React from 'react';

const HorizontalScrollList = ({ children }: { children: any}) => {
  return (
    <div className={`relative w-full overflow-y-auto overflow-x-scroll flex space-x-4 pb-4 snap-x snap-always ${styles.postListContainer}`}>
        {children}
      {/* <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-transparent to-white pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none" /> */}
    </div>
    
  );
};
