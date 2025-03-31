import { inject, injectable } from "inversify";

import { PostsRepository } from "../../repositories/postsRepositories";
import { BlogsQueryRepository } from "../../repositories/blogsRepositories";
import { PostDbType, PostViewType } from "../../repositories/postsRepositories/types";

@injectable()
export class PostsService {
    constructor(@inject(PostsRepository) private postsRepository: PostsRepository,
                @inject(BlogsQueryRepository) private blogsQueryRepository: BlogsQueryRepository) {
    }

    async addNewPost(
        dto: Omit<PostViewType, "id" | "blogName" | "createdAt">
    ): Promise<string | undefined> {
        const {title, shortDescription, content, blogId} = dto;

        const blog = await this.blogsQueryRepository.getBlogById(blogId);
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

        return this.postsRepository.addNewPost(newPost);
    }

    async updatePost(
        dto: Omit<PostViewType, "blogName" | "createdAt">
    ): Promise<boolean> {
        const {id, title, shortDescription, content, blogId} = dto;

        const blog = await this.blogsQueryRepository.getBlogById(blogId);
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

        return this.postsRepository.updatePost(updatedPost);
    }

    async deletePostById(id: string): Promise<boolean> {
        return this.postsRepository.deletePostById(id);
    }
}