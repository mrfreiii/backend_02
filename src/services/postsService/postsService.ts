import { postsRepository } from "../../repositories/postsRepositories";
import { BlogsQueryRepository } from "../../repositories/blogsRepositories";
import { PostDbType, PostViewType } from "../../repositories/postsRepositories/types";

export const postsService = {
    addNewPost: async (
        dto: Omit<PostViewType, "id" | "blogName" | "createdAt">
    ): Promise<string | undefined> => {
        const {title, shortDescription, content, blogId} = dto;

        // TODO: заменить new BlogsQueryRepository() на inject
        const blogsQueryRepository = new BlogsQueryRepository();
        const blog = await blogsQueryRepository.getBlogById(blogId);
        if (!blog) {
            return;
        }

        const newPost: PostDbType = {
            title,
            shortDescription,
            content,
            blogId,
            blogName: blog.name,
            createdAt: (new Date()).toISOString(),
        };

        return postsRepository.addNewPost(newPost);
    },
    updatePost: async (
        dto: Omit<PostViewType, "blogName" | "createdAt">
    ): Promise<boolean> => {
        const {id, title, shortDescription, content, blogId} = dto;

        // TODO: заменить new BlogsQueryRepository() на inject
        const blogsQueryRepository = new BlogsQueryRepository();
        const blog = await blogsQueryRepository.getBlogById(blogId);
        if (!blog) {
            return false;
        }

        const updatedPost: Omit<PostViewType, "createdAt"> = {
            id,
            title: title.trim(),
            shortDescription: shortDescription.trim(),
            content: content.trim(),
            blogId: blogId,
            blogName: blog.name,
        }

        return postsRepository.updatePost(updatedPost);
    },
    deletePostById: async (id: string): Promise<boolean> => {
        return postsRepository.deletePostById(id);
    },
}