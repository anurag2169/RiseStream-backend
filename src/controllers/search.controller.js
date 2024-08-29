import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";

const search = asyncHandler(async (req, res) => {
  const { query = "" } = req.query;

  const trimmedQuery = query.trim();

  // Split the trimmed query into individual words
  const searchWords = trimmedQuery.split(" ").filter(Boolean);

  // Build regex array for each word
  const regexArray = searchWords.map((word) => new RegExp(word, "i"));

  if (!query) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Query parameter is required"));
  }
    
  const users = trimmedQuery
    ? await User.find(
        {
          $or: [
            { fullName: { $in: regexArray } },
            { email: { $in: regexArray } },
            { username: { $in: regexArray } },
          ],
        },
        {
          password: 0,
          accessToken: 0,
          refreshToken: 0,
          watchHistory: 0,
          coverImage: 0,
          updatedAt: 0,
        }
      )
    : [];

  const videos = trimmedQuery
    ? await Video.find({
        $or: [
          { title: { $in: regexArray } },
          { description: { $in: regexArray } },
        ],
      })
    : [];

  const playlists = trimmedQuery
    ? await Playlist.find({
        $or: [
          { name: { $in: regexArray } },
          { description: { $in: regexArray } },
        ],
      })
    : [];

  const results = {
    users,
    videos,
    playlists,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, results, "Search successful"));
});

export { search };
