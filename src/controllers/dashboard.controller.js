import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  try {
    const userId = req.user._id;

    // Calculate total number of videos
    const totalVideos = await Video.countDocuments({ owner: userId });

    // Calculate total views on all videos
    const totalViewsPipeline = [
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
        },
      },
    ];

    const totalViewsResult = await Video.aggregate(totalViewsPipeline);
    const totalViews =
      totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;

    // Calculate number of likes on the user's videos
    const totalLikesPipeline = [
      {
        $match: {
          likedBy: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: 1 },
        },
      },
    ];

    const totalLikesResult = await Like.aggregate(totalLikesPipeline);
    const totalLikes =
      totalLikesResult.length > 0 ? totalLikesResult[0].totalLikes : 0;

    // Get total number of subscribers
    const totalSubscribers = await Subscription.countDocuments({
      channel: userId,
    });

    return res.status(201).json(
      new ApiResponse(200, "Channel metadata retrieved:", {
        totalViews,
        totalVideos,
        totalLikes,
        totalSubscribers,
      })
    );
  } catch (error) {
    console.error("Error getting user metrics:", error);
    new ApiError(500, "Internal Server Error");
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
});

export { getChannelStats, getChannelVideos };
