import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
  faPaperPlane,
  faFile,
  faChevronLeft,
  faChevronRight,
  faPause,
  faPlay,
  faVolumeMute,
  faVolumeUp
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { useUser } from "../Context";
import EmojiPicker from "emoji-picker-react";
import Loading_Chat from "../Loading_Chat/Loading_Chat";

const ChatBetweenUsers = () => {
  const { userById } = useUser();
  const [reload, setReload] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const { setShowChat } = useUser();
  const [cookies] = useCookies(["token"]);
  const [sentRequests, setSentRequests] = useState({});
  const [Mydata, SetMydata] = useState();

  const [loadingChat, setLoadingChat] = useState(false);

  const [not_Chat, setNot_Chat] = useState(false);

  // ⚡️ Ref for auto-scroll
  const bottomRef = useRef(null);
  const chatBoxRef = useRef(null);

  // ✅ دعم الرموز التعبيرية
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [input, setInput] = useState(""); // استخدام `input` بدلًا من `message` للحفاظ على التناسق

  // 🆕 أضف هذا في أعلى الكومبوننت
  const [selectedFiles, setSelectedFiles] = useState([]);

  // 🆕 دالة لاختيار الملفات
  const handleFileChange = (e) => {
    const filesArray = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...filesArray]);
  };

  // 🆕 دالة لحذف ملف معين قبل الإرسال
  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEmojiClick = (emojiObject) => {
    setInput((prevInput) => prevInput + emojiObject.emoji);
  };

  // =====================================================
  const [chat, setChat] = useState([]);

  useEffect(() => {
    const chatBox = chatBoxRef.current;
    if (!chatBox) return;

    chatBox.scrollTop = chatBox.scrollHeight;
  }, [chat.length]);

  useEffect(() => {
    document.body.classList.add("chat-page");
    return () => {
      document.body.classList.remove("chat-page");
    };
  }, []);

  useEffect(() => {
    setLoadingChat(true);
  }, []);

  useEffect(() => {
    axios
      .get("backendprojecr-production.up.railway.app/api/v2/auth/get_date_my", {
        headers: {
          Authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        SetMydata(res.data.data);
      })
      .catch((error) => {
        console.error("Error fetching data", error);
      })
      .finally(() => {
        setLoadingRequest(false);
      });
  }, []);

  const user1Id = Mydata?._id;
  const [user2Id, setUser2Id] = useState(null);

  // 👇 التمرير للأسفل تلقائياً عند تغير المحادثة
  // useEffect(() => {
  //   setTimeout(() => {
  //     const messages = document.querySelectorAll('.message');
  //     if (messages.length > 0) {
  //       messages[messages.length - 1].scrollIntoView({ behavior: 'smooth' });
  //     }
  //   }, 100); // تعيين تأخير بسيط لضمان تنفيذ التمرير
  // }, []);

  useEffect(() => {
    if (!user1Id || !userById) return;

    // Create a unique chat ID for caching
    const chatCacheKey = `chat_${user1Id}_${userById._id}`;
    const lastMessageTimeKey = `last_message_time_${user1Id}_${userById._id}`;

    // Get the last message timestamp to check for new messages
    const getLastMessageTime = () => {
      if (chat.length === 0) return 0;
      const lastMessage = chat[chat.length - 1];
      return lastMessage.timestamp || 0;
    };

    const fetchChat = async () => {
      try {
        // Check if we need to fetch new data
        const lastMessageTime = localStorage.getItem(lastMessageTimeKey) || 0;

        const res = await axios.get(
          `backendprojecr-production.up.railway.app/api/v2/chat/${user1Id}/${userById._id}`,
          {
            headers: {
              Authorization: `Bearer ${cookies.token}`,
            },
          }
        );

        const newMessages = res.data.data.messages;

        // Only update state if there are new messages
        setChat(newMessages);
        // Cache the messages
        localStorage.setItem(chatCacheKey, JSON.stringify(newMessages));

        // Update the last message timestamp
        if (newMessages.length > 0) {
          localStorage.setItem(lastMessageTimeKey, getLastMessageTime());
        }

        setLoadingChat(false);
      } catch (err) {
        if (err.response?.data?.errors) {
          const formattedErrors = {};
          err.response.data.errors.forEach((error) => {
            formattedErrors[error.path] = error.msg;
          });
        }

        if (
          err.response.data.message === "Chat not found between these users"
        ) {
          setLoadingChat(false);
          setNot_Chat(true);
        }
      }
    };

    // Try to load from cache first
    const cachedChat = localStorage.getItem(chatCacheKey);
    if (cachedChat) {
      setChat(JSON.parse(cachedChat));
      setLoadingChat(false);
    }

    // Then fetch fresh data
    fetchChat();

    // Use a more reasonable polling interval (3 seconds instead of 1)
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, [user1Id, userById, cookies.token]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && selectedFiles.length === 0) return;

    const formData = new FormData();
    formData.append("user1Id", user1Id);
    formData.append("user2Id", userById._id);
    formData.append("content", input);
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await axios.post(
        "backendprojecr-production.up.railway.app/api/v2/chat",
        formData,
        {
          headers: {
            Authorization: `Bearer ${cookies.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setChat(res.data.chat.messages);
      setInput("");
      setSelectedFiles([]); // 🆕 إفراغ الملفات بعد الإرسال
      setNot_Chat(false);

      // تمرير لأسفل مباشرة بعد إرسال الرسالة
      setTimeout(() => {
        if (chatBoxRef.current) {
          chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
      }, 100);
    } catch (err) {
      console.error("فشل في الإرسال:", err.response?.data || err.message);
    }
  };

  // =======================================================================

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);

  const openImageViewer = (mediaList, index) => {
    setAllImages(mediaList); // mediaList لازم تكون فيها { url, type }
    setCurrentImageIndex(index);
    setShowImageViewer(true);
  };

  const closeImageViewer = () => {
    setShowImageViewer(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };


  return (
    <div className="chat-container">
      {loadingChat ? (
        <Loading_Chat />
      ) : (
        <div className="chat-box" ref={chatBoxRef}>
          <div className="header_chat">
            <div className="user_img_name">
              <img
                src={
                  userById.profilImage
                    ? userById.profilImage.startsWith("http")
                      ? userById.profilImage
                      : `backendprojecr-production.up.railway.app/user/${userById.profilImage}`
                    : "/image/pngegg.png"
                }
                alt={`Image of ${userById.name}`}
              />
              <p>{userById?.name}</p>
            </div>
            <FontAwesomeIcon
              className="search_icon"
              onClick={() => setShowChat(false)}
              icon={faTimes}
            />
          </div>
          {not_Chat ? (
            <p className="not_chat">
              No previous conversations with {userById.name}. You can start a
              new chat now!
            </p>
          ) : null}

          {chat.map((msg, index) => {
            const senderIsMe =
              msg.sender === Mydata?._id || msg.sender?._id === Mydata?._id;

            // 🧠 إذا كانت files موجودة كسلسلة JSON، نحولها لمصفوفة
            let files = [];
            if (msg.files?.length) {
              try {
                files =
                  typeof msg.files[0] === "string"
                    ? JSON.parse(msg.files[0])
                    : msg.files;
              } catch (e) {
                console.error("Failed to parse files", e);
              }
            }

            return (
              <div
                key={index}
                className={`message ${senderIsMe ? "me" : "other"}`}
              >
                {/* {msg.content && <p>{msg.content}</p>} */}

                {/* عرض الملفات إذا موجودة */}
               {files.length > 0 && (
  <div className="message-files">
{files.map((file, i) => {
  if (!file || !file.url) return null;

  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name);
  const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(file.name);
  const isAudio = /\.(mp3|wav|ogg|m4a)$/i.test(file.name);

  // فقط الصور والفيديوهات للعرض داخل العارض
  const previewableFiles = files
    .filter(f => /\.(jpg|jpeg|png|gif|bmp|webp|mp4|webm|ogg|mov)$/i.test(f.name))
    .map(f => ({
      ...f,
      type: /\.(mp4|webm|ogg|mov)$/i.test(f.name) ? 'video' : 'image'
    }));

  const currentIndex = previewableFiles.findIndex(f => f.name === file.name);

  return (
    <div key={i} className="file-bubble">
      {isImage ? (
        <img
          src={file.url}
          alt={file.name || "image"}
          className="message-image"
          onClick={() => openImageViewer(previewableFiles, currentIndex)}
          style={{ cursor: "pointer" }}
        />
      ) : isVideo ? (
        <video
          src={file.url}
          className="message-video"
          controls
          onClick={() => openImageViewer(previewableFiles, currentIndex)}
          style={{
            maxWidth: "100%",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        />
      ) : isAudio ? (
        <audio
          src={file.url}
          controls
          className="message-audio"
        />
      ) : (
        <div className="containerrs">
          <div className="folder">
            <div className="front-side">
              <div className="tip"></div>
              <div className="cover"></div>
            </div>
          </div>
          <label className="custom-file-upload">
            <a className="title" href={file.url || "#"} download>
              <span className="scroll-wrapper">
                <span className="scrolling-text">
                  {file.name || "Download File"}
                </span>
              </span>
            </a>
          </label>
        </div>
      )}
    </div>
  );
})}



  </div>
)}


                {msg.content && <p>{msg.content}</p>}
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>
      )}

      {/* ✅ إدخال الرموز التعبيرية داخل مربع الإدخال */}
      <form className="chat-input" onSubmit={sendMessage}>
        <div className="Emoji_input">
          <span
            type="button"
            className="emoji-button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😊
          </span>

          <input
            type="file"
            id="file-upload"
            multiple
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <label
            htmlFor="file-upload"
            className="emoji-button"
            title="Attach file"
          >
            <FontAwesomeIcon icon={faFile} />
          </label>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onClick={() => setShowEmojiPicker(false)}
            placeholder="اكتب رسالة..."
          />
        </div>

        {/* 🆕 عرض معاينة الملفات المرفقة */}
        {selectedFiles.length > 0 && (
          <div className="file-preview-container">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-preview-item">
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="preview-image"
                  />
                ) : (
                  <div className="preview-file">
                    <span role="img" aria-label="file">
                      📄
                    </span>{" "}
                    {file.name}
                  </div>
                )}
                <button type="button" onClick={() => handleRemoveFile(index)}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          style={
            loadingChat
              ? { pointerEvents: "none", opacity: 0.5, cursor: "not-allowed" }
              : {}
          }
        >
          {/* Send */}
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
        {/* <FontAwesomeIcon icon={faPaperPlane} /> */}
      </form>
      {showEmojiPicker && (
        <EmojiPicker
          height="calc(70% - 70px)"
          width="100%"
          style={{ position: "absolute", button: "50px", left: "0" }}
          onEmojiClick={handleEmojiClick}
        />
      )}

      {showImageViewer && allImages[currentImageIndex] && (
  <div className="image-viewer-overlay" onClick={closeImageViewer}>
    <div className="image-viewer" onClick={(e) => e.stopPropagation()}>
      <button className="close-btn" onClick={closeImageViewer}>
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <button className="nav-btn left" onClick={prevImage}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <button className="nav-btn right" onClick={nextImage}>
        <FontAwesomeIcon icon={faChevronRight} />
      </button>

      {/* عرض حسب النوع */}
      {allImages[currentImageIndex]?.type === "video" ? (
        <video
          src={allImages[currentImageIndex].url}
          controls
          autoPlay
          className="full-image"
        />
      ) : allImages[currentImageIndex]?.type === "image" ? (
        <img
          src={allImages[currentImageIndex].url}
          alt="preview"
          className="full-image"
        />
      ) : allImages[currentImageIndex]?.type === "audio" ? (
        <audio
          src={allImages[currentImageIndex].url}
          controls
          autoPlay
          className="full-audio"
        />
      ) : (
        <div className="full-file">
          <p>📁 {allImages[currentImageIndex].name}</p>
          <a
            href={allImages[currentImageIndex].url}
            download
            className="download-link"
          >
            تحميل الملف
          </a>
        </div>
      )}
    </div>
  </div>
)}

    </div>
  );
};

export default ChatBetweenUsers;
