import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist

  if (!name.trim()) {
    new ApiError(400, "Please give a playlist name");
  }
  if (!description.trim()) {
    new ApiError(400, "Please give a proper description");
  }

  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "please give valid userId");
  }
  const playLists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    {
      $unwind: "$ownerDetails",
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        videos: "$videoDetails",
        owner: {
          _id: "$ownerDetails._id",
          fullName: "$ownerDetails.fullName",
          avatar: "$ownerDetails.avatar",
          email: "$ownerDetails.email",
          username: "$ownerDetails.username",
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(201)
    .json(new ApiResponse(200, playLists, "Get user playlists successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "please give valid playlist Id");
  }

  // const playList = await Playlist.findById(playlistId);
  const playList = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    {
      $unwind: "$ownerDetails",
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
            },
          },
          {
            $unwind: "$ownerDetails",
          },
          {
            $project: {
              _id: 1,
              title: 1,
              description: 1,
              videoFile: 1,
              thumbnail: 1,
              duration: 1,
              views: 1,
              isPublished: 1,
              createdAt: 1,
              updatedAt: 1,
              owner: {
                _id: "$ownerDetails._id",
                fullName: "$ownerDetails.fullName",
                avatar: "$ownerDetails.avatar",
                email: "$ownerDetails.email",
                username: "$ownerDetails.username",
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        videos: "$videoDetails",
        owner: {
          _id: "$ownerDetails._id",
          fullName: "$ownerDetails.fullName",
          avatar: "$ownerDetails.avatar",
          email: "$ownerDetails.email",
          username: "$ownerDetails.username",
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!playList || playList.length === 0) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, playList, "Get Playlist Successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Please Select a playlist");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Please Select a video");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Check if the video is already in the playlist
  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video is already in the playlist");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  return res
    .status(201)
    .json(
      new ApiResponse(200, {}, "Video is added succesfully in the playlist")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Please select a valid playlist");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Please select a valid video");
  }
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  const videoIndex = playlist.videos.indexOf(videoId);

  if (videoIndex === -1) {
    throw new ApiError(400, "Video not found in the playlist");
  }

  playlist.videos.splice(videoIndex, 1);
  await playlist.save();

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Video is removed successfully from the playlist"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Please select a valid playlist");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(201)
    .json(new ApiResponse(200, {}, "playlist is succesfully removed"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Please select a valid playlist");
  }
  if (!name.trim()) {
    throw new ApiError(400, "Please Enter a playlist name");
  }
  if (!description.trim()) {
    throw new ApiError(400, "Please Enter a playlist description");
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Playlist details updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
