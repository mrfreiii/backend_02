export type addPostDTO = {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
}

export type updatePostDTO = {
    postId: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
}
