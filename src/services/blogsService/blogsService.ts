import { blogsRepository } from "../../repositories/blogsRepositories";
import { BlogDbType, BlogViewType } from "../../repositories/blogsRepositories/types";

export const blogsService = {
    addNewBlog: async ( dto: Omit<BlogViewType, "id" | "createdAt">): Promise<string> => {
        const { name, description, websiteUrl, isMembership } = dto;

        const newBlog: BlogDbType = {
            name: name.trim(),
            description: description.trim(),
            websiteUrl: websiteUrl.trim(),
            isMembership: typeof isMembership === "boolean" ? isMembership : false,
            createdAt: (new Date()).toISOString(),
        };

        return blogsRepository.addNewBlog(newBlog);
    },
    updateBlog: async ( dto: Omit<BlogViewType, "createdAt"> ): Promise<boolean> => {
        const { id, name, description, websiteUrl, isMembership } = dto;

        const updatedBlog: Omit<BlogViewType, "createdAt"> = {
            id,
            name: name.trim(),
            description: description.trim(),
            websiteUrl: websiteUrl.trim(),
            isMembership: typeof isMembership === "boolean" ? isMembership : false,
        }

        return blogsRepository.updateBlog(updatedBlog);
    },
    deleteBlogById: async (id: string): Promise<boolean> => {
        return blogsRepository.deleteBlogById(id);
    },
}