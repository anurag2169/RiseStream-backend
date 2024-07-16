import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const pageInt = parseInt(page);
  const limitInt = parseInt(limit);

  // Calculate the number of documents to skip
  const skip = (pageInt - 1) * limitInt;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video Not Found!");
  }

  const aggregatedComment = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        aggregatedComment,
        "Comments are fetched successfully"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video Id required");
  }

  if (!content.trim()) {
    throw new ApiError(400, "Please add a comment");
  }

  const comment = await Comment.create({
    content: content,
    video: videoId,
    owner: req.user,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, comment, "Comment Added Successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "please select a proper comment before edit");
  }
  if (!content.trim()) {
    throw new ApiError(400, "Please add a new comment");
  }
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "comment not found!");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You don't have permission to update this comment!"
    );
  }

  const updateComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: content,
      },
    },
    {
      new: true,
    }
  );

  if (!updateComment) {
    throw new ApiError(500, "something went wrong while updating comment");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, updateComment, "Comment Updated Successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "please select a proper comment before edit");
  }
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "comment not found!");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You don't have permission to delete this comment!"
    );
  }

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted Successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
