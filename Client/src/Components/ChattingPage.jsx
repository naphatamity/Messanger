import { Avatar, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CallIcon from "@mui/icons-material/Call";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import styled from "@emotion/styled";
import SendIcon from "@mui/icons-material/Send";
import InputEmoji from "react-input-emoji";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { ChatlogicStyling, isSameSender } from "./ChatstyleLogic";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentMessages, sendMessageApi } from "./Redux/Chatting/action";
import { sendMessage } from "./Redux/Chatting/action";
import { addUnseenmsg } from "./Redux/Notification/action";
import { MessageRepository } from "@amityco/js-sdk";
import io from "socket.io-client";
const SERVER_POINT = "https://messenger-clo.herokuapp.com";
var socket, currentChattingWith;

export const ChattingPage = () => {
  const { user, token } = useSelector((store) => store.user);
  const { messages } = useSelector((store) => store.chatting);
  const reduxUserStore = useSelector((store) => store.user);
  console.log("reduxStore: ", reduxUserStore);
  const [chatMessage, setChatMessage] = useState([]);
  var { unseenmsg } = useSelector((store) => store.notification);
  const {
    chatting: {
      isGroupChat,
      chatName,
      user: { pic, name, userId },
      _id,
    },
  } = useSelector((store) => store.chatting);
  const scrolldiv = createRef();
  const dispatch = useDispatch();
  console.log("userId", reduxUserStore.userId.userId);
  console.log("senderId", userId);
  function queryChatMessage() {
    console.log("channel id", _id);
    const liveCollection = MessageRepository.queryMessages({ channelId: _id });
    let messages = liveCollection.models;

    liveCollection.on("dataUpdated", (data) => {
      messages = data;
      console.log("messages: ", messages);
      let mappedMessages = messages.map((item) => {
        return {
          _id: reduxUserStore.userId.userId,
          sender: {
            _id: userId,
            name: "sdsd",
            email: "dfsdsf@mdvmkodsv.com",
            pic: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
          },
          content: item.data.text,
          chat: {
            _id: item.messageId,
            chatName: "sender",
            isGroupChat: false,
            users: [userId, reduxUserStore.userId.userId],
            createdAt: item.createdAt,
            updatedAt: item.editedAt,
            latestMessage: "633e8d007dbc394e1dd2a711",
          },
          readBy: [],
          createdAt: item.createdAt,
          updatedAt: item.createdAt,
        };
      });
      console.log("mappedMessages: ", mappedMessages);
      setChatMessage(mappedMessages);
    });
  }
  useEffect(() => {
    queryChatMessage();
  }, []);

  // useEffect(() => {
  //   socket = io(SERVER_POINT);
  //   socket.emit("setup", user);
  //   socket.on("connected", () => {
  //     // setconnectedtosocket(true);
  //   });
  // }, []);
  // useEffect(() => {
  //   //_id is of selected chat so that user can join same chat room
  //   if (!_id) return;
  //   dispatch(fetchCurrentMessages(_id, token, socket));

  //   currentChattingWith = _id;
  // }, [_id]);
  // useEffect(() => {
  //   const scrollToBottom = (node) => {
  //     node.scrollTop = node.scrollHeight;
  //   };
  //   scrollToBottom(scrolldiv.current);
  // });

  // useEffect(() => {
  //   socket.on("message recieved", (newMessage) => {
  //     if (!currentChattingWith || currentChattingWith !== newMessage.chat._id) {
  //       handleNotyfy(newMessage);
  //     } else {
  //       dispatch(sendMessage(newMessage));
  //     }
  //   });
  // }, []);
  // const handleNotyfy = (newMessage) => {
  //   dispatch(addUnseenmsg(newMessage));
  // };
  return (
    <div className="chattingpage">
      <div className="top-header">
        <div className="user-header">
          <Avatar src={isGroupChat ? "" : pic} />
          <p className="user-name">{isGroupChat ? chatName : name}</p>
        </div>
        <div>
          <div className="user-fet">
            <SearchIcon />
            <CallIcon />
            <VideoCallIcon />
            <MoreHorizIcon />
          </div>
        </div>
      </div>
      <div ref={scrolldiv} className="live-chat">
        {chatMessage.map((el, index) => (
          <div
            key={index}
            className={
              el.sender._id != user._id ? "rihgtuser-chat" : "leftuser-chat"
            }
          >
            <div
              className={el.sender._id != user._id ? "right-avt" : "left-avt"}
            >
              <div className={ChatlogicStyling(el.sender._id, user._id)}>
                <p>{el.content}</p>
                <p className="time chat-time">
                  {new Date(el.createdAt).getHours() +
                    ":" +
                    new Date(el.createdAt).getMinutes()}
                </p>
              </div>

              {isSameSender(messages, index) ? (
                <Avatar
                  src={el.sender._id != user._id ? el.sender.pic : user.pic}
                />
              ) : (
                <div className="blank-div"></div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="sender-cont">
        <InputContWithEmog id={_id} token={token} socket={socket} />
      </div>
    </div>
  );
};
const ColorButton = styled(Button)(() => ({
  color: "white",
  fontSize: "20px",
  textTransform: "none",
  padding: "12px",
  marginRight: "15px",
  backgroundColor: "#5865f2",
  "&:hover": {
    backgroundColor: "#3a45c3",
  },
}));
function InputContWithEmog({ id, token, socket }) {
  const [text, setText] = useState("");
  const dispatch = useDispatch();

  function handleOnEnter(text) {
    dispatch(
      sendMessageApi(
        {
          content: text,
          chatId: id,
        },
        token,
        socket
      )
    );
  }
  function handleChatClick() {
    dispatch(
      sendMessageApi(
        {
          content: text,
          chatId: id,
        },
        token,
        socket
      )
    );
    setText("");
  }

  return (
    <>
      <div className="search-cont send-message">
        <InputEmoji
          value={text}
          onChange={setText}
          cleanOnEnter
          onEnter={handleOnEnter}
          placeholder="Type a message"
        />
      </div>
      <ColorButton
        onClick={handleChatClick}
        variant="contained"
        endIcon={<SendIcon />}
      ></ColorButton>
    </>
  );
}
