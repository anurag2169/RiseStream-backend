import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";

const search = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Query parameter is required"));
  }

  // Build regular expression for partial matching
  const regex = new RegExp(query, "i");

  const users = query
    ? await User.find({
        $or: [{ fullName: regex }, { email: regex }, { username: regex }],
      })
    : [];

  const videos = query
    ? await Video.find({
        $or: [{ title: regex }, { description: regex }],
      })
    : [];

  const playlists = query
    ? await Playlist.find({
        $or: [{ name: regex }, { description: regex }],
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
