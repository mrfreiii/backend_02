import { inject, injectable } from "inversify";

import { BlogsRepository } from "../../repositories/blogsRepositories";
import { BlogDbType, BlogViewType } from "../../repositories/blogsRepositories/types";

@injectable()
export class BlogsService {
    constructor(@inject(BlogsRepository) private blogsRepository: BlogsRepository) {}

    async addNewBlog( dto: Omit<BlogViewType, "id" | "createdAt">): Promise<string> {
        const { name, description, websiteUrl, isMembership } = dto;

        const newBlog: BlogDbType = {
            name: name.trim(),
            description: description.trim(),
            websiteUrl: websiteUrl.trim(),
            isMembership: typeof isMembership === "boolean" ? isMembership : false,
            createdAt: (new Date()).toISOString(),
        };

        return this.blogsRepository.addNewBlog(newBlog);
    }

    async updateBlog( dto: Omit<BlogViewType, "createdAt"> ): Promise<boolean> {
        const { id, name, description, websiteUrl, isMembership } = dto;

        const updatedBlog: Omit<BlogViewType, "createdAt"> = {
            id,
            name: name.trim(),
            description: description.trim(),
            websiteUrl: websiteUrl.trim(),
            isMembership: typeof isMembership === "boolean" ? isMembership : false,
        }

        return this.blogsRepository.updateBlog(updatedBlog);
    }

    async deleteBlogById(id: string): Promise<boolean> {
        return this.blogsRepository.deleteBlogById(id);
    }
}