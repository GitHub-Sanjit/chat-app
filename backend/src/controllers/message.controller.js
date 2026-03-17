import User from "../models/user.model.js";
import Message from "./../models/message.model.js";
import cloudnary from "./../lib/cloudinary.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in GetUsersForSideBar: ", message.error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receverId: userToChatId },
        { senderId: userToChatId, receverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages Controllers: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receverId } = req.params;

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudnary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // TODO: realtime functionality goes here => socket.io

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in SendMessage Controllers: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
