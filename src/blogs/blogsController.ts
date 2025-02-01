import { Request, Router, Response } from "express";
import { blogsRepository, BlogType } from "../repositories/blogsRepository";

// import { db } from "../db/db";
// import {
//     AvailableResolutionsType,
//     CreateVideoRequestType,
//     CreateVideoResponseType,
//     DeleteVideoByIdRequestType, DeleteVideosByIdResponseType,
//     GetVideoByIdRequestType,
//     GetVideoByIdResponseType,
//     GetVideosRequestType,
//     GetVideosResponseType,
//     UpdateVideoRequestType,
//     UpdateVideoResponseType,
//     VideoType,
// } from "./types";
// import { ErrorFieldType } from "../types/types";
// import {
//     availableResolutionsFieldValidator, booleanFieldValidator,
//     isoDateFieldValidator, numberFieldValidator,
//     stringFieldValidator
// } from "./validators";
// import { generateErrorResponse } from "../utils/errorResponseHelper";
//
// export const AVAILABLE_RESOLUTIONS: AvailableResolutionsType[] = ["P144", "P240", "P360", "P480", "P720", "P1080", "P1440", "P2160"];

export const blogsRouter = Router();

const blogsController = {
    getBlogs: (req: Request, res: Response<BlogType[]>) => {
        const allBlogs = blogsRepository.getAllBlogs();

        res
            .status(200)
            .json(allBlogs);
    },
    // getVideoById: (req: GetVideoByIdRequestType, res: GetVideoByIdResponseType) => {
    //     const allVideos = db.videos;
    //
    //     const foundVideo = allVideos?.find((video) => video?.id === +req?.params?.id);
    //
    //     if (!foundVideo) {
    //         res.sendStatus(404);
    //         return;
    //     }
    //
    //     res
    //         .status(200)
    //         .json(foundVideo);
    // },
    // createVideo: (req: CreateVideoRequestType, res: CreateVideoResponseType) => {
    //     {
    //         const title = req?.body?.title;
    //         const author = req?.body?.author;
    //         const availableResolutions = req?.body?.availableResolutions;
    //
    //         const errorsArray: ErrorFieldType[] = [];
    //
    //         stringFieldValidator({
    //             fieldName: "title",
    //             value: title,
    //             maxLength: 40,
    //             errorsArray
    //         });
    //         stringFieldValidator({
    //             fieldName: "author",
    //             value: author,
    //             maxLength: 20,
    //             errorsArray
    //         });
    //         availableResolutionsFieldValidator({availableResolutions, errorsArray});
    //
    //         if (errorsArray.length > 0) {
    //             const errors_ = generateErrorResponse(errorsArray);
    //             res
    //                 .status(400)
    //                 .json(errors_)
    //
    //             return;
    //         }
    //
    //         const nowPlusOneDay = Date.now() + 86400000;
    //
    //         const newVideo: VideoType = {
    //             ...req.body,
    //             id: +Date.now(),
    //             canBeDownloaded: false,
    //             minAgeRestriction: null,
    //             createdAt: new Date().toISOString(),
    //             publicationDate: new Date(nowPlusOneDay).toISOString(),
    //             availableResolutions: req.body.availableResolutions || ["P144"]
    //         }
    //
    //         db.videos = [...db.videos, newVideo];
    //         res.status(201).json(newVideo);
    //     }
    // },
    // updateVideo: (req: UpdateVideoRequestType, res: UpdateVideoResponseType) => {
    //     {
    //         const videoId = +req?.params?.id;
    //         const foundVideo = db.videos.find((video) => video?.id === videoId);
    //         if (!foundVideo) {
    //             res.sendStatus(404);
    //             return;
    //         }
    //
    //         const title = req?.body?.title;
    //         const author = req?.body?.author;
    //         const availableResolutions = req?.body?.availableResolutions;
    //         const canBeDownloaded = req?.body?.canBeDownloaded;
    //         const minAgeRestriction = req?.body?.minAgeRestriction;
    //         const publicationDate = req?.body?.publicationDate;
    //
    //         const errorsArray: ErrorFieldType[] = [];
    //
    //         stringFieldValidator({
    //             fieldName: "title",
    //             value: title,
    //             maxLength: 40,
    //             errorsArray
    //         });
    //         stringFieldValidator({
    //             fieldName: "author",
    //             value: author,
    //             maxLength: 20,
    //             errorsArray
    //         });
    //         availableResolutionsFieldValidator({availableResolutions, errorsArray});
    //         booleanFieldValidator({
    //             fieldName: "canBeDownloaded",
    //             value: canBeDownloaded,
    //             errorsArray
    //         });
    //         numberFieldValidator({
    //             fieldName: "minAgeRestriction",
    //             value: minAgeRestriction,
    //             min: 1,
    //             max: 18,
    //             errorsArray
    //         });
    //         isoDateFieldValidator({
    //             fieldName: "publicationDate",
    //             value: publicationDate,
    //             errorsArray
    //         })
    //
    //         if (errorsArray.length > 0) {
    //             const errors_ = generateErrorResponse(errorsArray);
    //             res
    //                 .status(400)
    //                 .json(errors_)
    //
    //             return;
    //         }
    //
    //
    //         const updatedVideo: VideoType = {
    //             ...foundVideo,
    //             title,
    //             author,
    //             availableResolutions: availableResolutions || foundVideo.availableResolutions,
    //             canBeDownloaded: canBeDownloaded !== undefined ? canBeDownloaded : foundVideo.canBeDownloaded,
    //             minAgeRestriction: minAgeRestriction !== undefined ? minAgeRestriction : foundVideo.minAgeRestriction,
    //             publicationDate: publicationDate || foundVideo.publicationDate,
    //         }
    //
    //         const updatedVideos = db.videos.map((video) => {
    //             if (video.id === videoId) {
    //                 return updatedVideo;
    //             }
    //
    //             return video;
    //         })
    //
    //         db.videos = updatedVideos;
    //         res.sendStatus(204);
    //     }
    // },
    // deleteVideoById: (req: DeleteVideoByIdRequestType, res: DeleteVideosByIdResponseType) => {
    //     const allVideos = db.videos;
    //     const filteredVideos = allVideos.filter((video) => video.id !== +req?.params?.id);
    //
    //     if(allVideos.length === filteredVideos.length){
    //         res.sendStatus(404);
    //         return;
    //     }
    //
    //     db.videos = filteredVideos;
    //     res.sendStatus(204)
    // },
}

blogsRouter.get("/", blogsController.getBlogs);
// videoRouter.get("/:id", videoController.getVideoById);
// videoRouter.post("/", videoController.createVideo);
// videoRouter.put("/:id", videoController.updateVideo);
// videoRouter.delete("/:id", videoController.deleteVideoById);