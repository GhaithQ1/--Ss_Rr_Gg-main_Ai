import React, { useEffect, useState, useRef, use,useTransition } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import "./Bosts.css";

import { Relod_like } from "../Relod_like/Relod_like";
import { format } from 'date-fns';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  faCheck,
  faTimes,
  faHeart,
  faComment,
  faBookmark,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useCookies } from "react-cookie";
import { Relod_post } from "../Relod_post/Relod_post";
import Loading_main from "../Loading_Main/Loading_main";
import Slider from "react-slick";
import Loading_coment from "../Loading_coment/Loading_coment";
import Loading_Bookmark from "../Loading_Bookmark/Loading_Bookmark";
import Loading_Filter_post from "../Loading_Filter_post/Loading_Filter_post";

import { useUser } from "../Context";

// Facebook-like Modal Gallery Component
const MediaGalleryModal = ({
  isOpen,
  onClose,
  media,
  currentIndex,
  setCurrentIndex,
}) => {
  if (!isOpen) return null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const currentMedia = media[currentIndex];

  return createPortal(
    <div className="fb-gallery-modal-overlay" onClick={onClose}>
      <div
        className="fb-gallery-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="fb-gallery-modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="fb-gallery-modal-navigation">
          <button className="fb-gallery-modal-prev" onClick={handlePrevious}>
            &#10094;
          </button>

          <div className="fb-gallery-modal-media-container">
            {currentMedia.type === "image" ? (
              <img
                src={currentMedia.src}
                alt=""
                className="fb-gallery-modal-media"
              />
            ) : (
              <video
                src={currentMedia.src}
                controls
                className="fb-gallery-modal-media"
                autoPlay
              />
            )}
          </div>

          <button className="fb-gallery-modal-next" onClick={handleNext}>
            &#10095;
          </button>
        </div>

        <div className="fb-gallery-modal-thumbnails">
          {media.map((item, idx) => (
            <div
              key={item.key}
              className={`fb-gallery-modal-thumbnail ${idx === currentIndex ? "active" : ""
                }`}
              onClick={() => setCurrentIndex(idx)}
            >
              {item.type === "image" ? (
                <img src={item.src} alt="" />
              ) : (
                <div className="video-thumbnail">
                  <img src={item.src.replace(/\.[^.]+$/, ".jpg")} alt="" />
                  <span className="video-icon">▶</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

const Bosts = () => {
    const [isPending, startTransition] = useTransition(); // 👈 React 19 feature

  const audioRefs = useRef([]);
  const [posts, setPosts] = useState([]);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [cookies] = useCookies(["token"]);
  const inputRef = useRef();
  const [NewComment, SetNewComment] = useState([]);
  const [showCommentForPostId, setShowCommentForPostId] = useState(null);
  const [liked, setLiked] = useState([]);
  const [likeds, setLikeds] = useState(false);
  const [bookMark, setbookMark] = useState("");
  const [Mydata, SetMydata] = useState();
  const [bookId, SetbookId] = useState();
  const [solvedPost_3, SetsolvedPost_3] = useState();
  const [solvedPost_2, SetsolvedPost_2] = useState();
  const [solvedPost_4, SetsolvedPost_4] = useState();
  const [lod, setlod] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [Relod_likee, setRelod_likee] = useState(false);
  const [Relod_likeeid, setRelod_likeeid] = useState("");
  const bottomRef = useRef(null);

  const [relod, setrelod] = useState(false);

  const [relod_1, setrelod_1] = useState(false);
  const [relod_coment, setrelod_coment] = useState(false);
  const [relod_Bookmark, setrelod_Bookmark] = useState(false);

  const { type_post } = useUser();
  const { type_post_role } = useUser();

  const playSound = (index) => audioRefs.current[index].play();

  const Commentary = async (id, e) => {
    e.preventDefault();
    const commentValue = inputRef.current.value;
    try {
      setrelod_coment(true);
      const res = await axios.post(
        `backendprojecr-production.up.railway.app/api/v2/post/create_post_comments/${id}`,
        {
          comment: commentValue,
        },
        {
          headers: { Authorization: `Bearer ${cookies.token}` },
        }
      );
      inputRef.current.value = "";
      SetNewComment(res.data.data.comments);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    setrelod_1(true);
  }, []);

  useEffect(() => {
    startTransition(async()=>{

      try {
        const res = await axios.get(`backendprojecr-production.up.railway.app/api/v2/post?type=${type_post}&role=${type_post_role}`, {
          headers: { Authorization: `Bearer ${cookies.token}` },
        });
        setPosts(res.data.data);
        // console.log(res.data.data.ifrem);
        setRelod_likee(false);
        setrelod_1(false);
        setrelod_coment(false);
        setrelod_Bookmark(false);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    

    })

  }, [NewComment, relod_Bookmark, likeds ,type_post ,type_post_role]);

  const handleCommentClick = (postId) =>
    setShowCommentForPostId(showCommentForPostId === postId ? null : postId);
  const handleCloseComment = () => setShowCommentForPostId(null);

  const Likes = async (id) => {
    try {
      setRelod_likee(true);
      await axios.post(
        `backendprojecr-production.up.railway.app/api/v2/post/toggle_post_like/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${cookies.token}` },
        }
      );
      setLikeds(!likeds);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };
  const handleBook = (id) => setbookMark(id);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const res = await axios.get(
          "backendprojecr-production.up.railway.app/api/v2/auth/get_date_my",
          {
            headers: { Authorization: `Bearer ${cookies.token}` },
          }
        );
        SetMydata(res.data.data._id);
        SetbookId(res.data.data.savedPosts);
        SetsolvedPost_3(res.data.data.solvedPost_3);
        SetsolvedPost_2(res.data.data.solvedPost_2);
        SetsolvedPost_4(res.data.data.solvedPost_4);
        setrelod(false);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchMyData();
  }, [lod, relod, bookId]);

  const bookMarks = async (id) => {
    try {
      setrelod_Bookmark(true);
      await axios.post(
        `backendprojecr-production.up.railway.app/api/v2/auth/toggleSavedPost/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${cookies.token}` },
        }
      );
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [NewComment]);

  const [answerTest, setanswerTest] = useState([]);

  let answers = [];

  const chick_post_3 = async (IdPost, id, answer) => {
    try {
      answers = [
        ...answers,
        {
          questionId: id,
          answer: answer,
        },
      ];

      // إرسال البيانات إلى API
      const res = await axios.post(
        `backendprojecr-production.up.railway.app/api/v2/post/post_3_chick`, // URL الخاص بالـ API
        {
          postId: IdPost,
          answers,
        },
        {
          headers: { Authorization: `Bearer ${cookies.token}` }, // إضافة التوكن في الهيدر
        }
      );

      // استلام البيانات من الـ API
    } catch (error) {
      console.error("Error fetching data", error); // في حال حدوث خطأ
    }
  };

  const chick_post_2 = async (IdPost, id, answer) => {
    try {
      answers = [
        ...answers,
        {
          questionId: id,
          answer: answer,
        },
      ];

      // إرسال البيانات إلى API
      const res = await axios.post(
        `backendprojecr-production.up.railway.app/api/v2/post/post_2_chick`, // URL الخاص بالـ API
        {
          postId: IdPost,
          answers,
        },
        {
          headers: { Authorization: `Bearer ${cookies.token}` }, // إضافة التوكن في الهيدر
        }
      );

      // استلام البيانات من الـ API
      console.log(res.data);
    } catch (error) {
      console.error("Error fetching data", error); // في حال حدوث خطأ
    }
  };

  // ========================================

  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState({});
  const [activeIcon, setActiveIcon] = useState({});
  const [localAnswers, setLocalAnswers] = useState({});

  // ===========================================

  const [id, setid] = useState();

  // ثاني شيء الريلود:

  // ===============================================================

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // =========================================

  const [questionIndices, setQuestionIndices] = useState({});

  const chick_post_4 = async (IdPost, id, answer) => {
    try {
      answers = [
        ...answers,
        {
          questionId: id,
          answer: answer,
        },
      ];

      // إرسال البيانات إلى API
      const res = await axios.post(
        `backendprojecr-production.up.railway.app/api/v2/post/post_4_chick`, // URL الخاص بالـ API
        {
          postId: IdPost,
          answers,
        },
        {
          headers: { Authorization: `Bearer ${cookies.token}` }, // إضافة التوكن في الهيدر
        }
      );
    } catch (error) {
      console.error("Error fetching data", error); // في حال حدوث خطأ
    }
  };

  // ================================

  const [currentPagee, setcurrentPagee] = useState(0); // صفحة البداية

  const [pageByPost, setPageByPost] = useState({});

  const addNewQuestion = () => {
    setTimeout(() => {
      const lastQuestion = document.querySelector(".comment section");
      console.log(lastQuestion);
      lastQuestion?.scrollIntoView({ behavior: "smooth" });
    });
  };
  const addNewQuestion_com = () => {
    setTimeout(() => {
      const lastQuestion = document.querySelector(".comment > *:last-child");
      lastQuestion?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const commentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (commentRef.current && !commentRef.current.contains(event.target)) {
        setShowCommentForPostId(null); // إغلاق الكومنتس
      }
    };

    if (showCommentForPostId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCommentForPostId]);

  const post5SliderRef = useRef(null);

  return (
    <div className="bosts">
      {/* Modal Gallery Component */}
      <MediaGalleryModal
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        media={galleryMedia}
        currentIndex={currentMediaIndex}
        setCurrentIndex={setCurrentMediaIndex}
      />

      {/* عرض البوستات حسب النوع */}
            {isPending && <Loading_Filter_post/>}

      {
        
        posts.map((post, index) => {
          if (post.type === "post_1") {
            const itemsPerPage = 2;

            const handleNext = (postId) => {
              setPageByPost((prevPages) => {
                const currentPagee = prevPages[postId] || 0;
                if ((currentPagee + 1) * itemsPerPage < post.boxes.length) {
                  return { ...prevPages, [postId]: currentPagee + 1 };
                }
                return prevPages;
              });
            };

            const handlePrev = (postId) => {
              setPageByPost((prevPages) => {
                const currentPagee = prevPages[postId] || 0;
                if (currentPagee > 0) {
                  return { ...prevPages, [postId]: currentPagee - 1 };
                }
                return prevPages;
              });
            };

            const currentPagee = pageByPost[post._id] || 0;
            const currentBoxes = post.boxes.slice(
              currentPagee * itemsPerPage,
              (currentPagee + 1) * itemsPerPage
            );

            return (
              <div key={index} className="all_bost click_and_listen posts1">
                <div className="name_shoole">
                  <img
                    src={
                      post.user
                        ? `backendprojecr-production.up.railway.app/user/${post.user.profilImage}`
                        : "/image/pngegg.png"
                    }
                    alt=""
                  />
                  <div className="date_shoole">
                    <p>{post.user ? post.user.name : null}{post?.user?.role === "employee" && (<svg className="documentation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.007 2.10377C8.60544 1.65006 7.08181 2.28116 6.41156 3.59306L5.60578 5.17023C5.51004 5.35763 5.35763 5.51004 5.17023 5.60578L3.59306 6.41156C2.28116 7.08181 1.65006 8.60544 2.10377 10.007L2.64923 11.692C2.71404 11.8922 2.71404 12.1078 2.64923 12.308L2.10377 13.993C1.65006 15.3946 2.28116 16.9182 3.59306 17.5885L5.17023 18.3942C5.35763 18.49 5.51004 18.6424 5.60578 18.8298L6.41156 20.407C7.08181 21.7189 8.60544 22.35 10.007 21.8963L11.692 21.3508C11.8922 21.286 12.1078 21.286 12.308 21.3508L13.993 21.8963C15.3946 22.35 16.9182 21.7189 17.5885 20.407L18.3942 18.8298C18.49 18.6424 18.6424 18.49 18.8298 18.3942L20.407 17.5885C21.7189 16.9182 22.35 15.3946 21.8963 13.993L21.3508 12.308C21.286 12.1078 21.286 11.8922 21.3508 11.692L21.8963 10.007C22.35 8.60544 21.7189 7.08181 20.407 6.41156L18.8298 5.60578C18.6424 5.51004 18.49 5.35763 18.3942 5.17023L17.5885 3.59306C16.9182 2.28116 15.3946 1.65006 13.993 2.10377L12.308 2.64923C12.1078 2.71403 11.8922 2.71404 11.692 2.64923L10.007 2.10377ZM6.75977 11.7573L8.17399 10.343L11.0024 13.1715L16.6593 7.51465L18.0735 8.92886L11.0024 15.9999L6.75977 11.7573Z"></path></svg>)} {post?.user?.role === "employee" && (<span className="type_user">Outstanding Student</span>)}</p>
                    <span>
                      {format(new Date(post.createdAt), "MMM dd, yyyy, hh:mm a")}
                      {post?.user?.role === "employee" && (
                        <>
                          <span>•</span>
                          <svg className="world" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.23509 6.45329C4.85101 7.89148 4 9.84636 4 12C4 16.4183 7.58172 20 12 20C13.0808 20 14.1116 19.7857 15.0521 19.3972C15.1671 18.6467 14.9148 17.9266 14.8116 17.6746C14.582 17.115 13.8241 16.1582 12.5589 14.8308C12.2212 14.4758 12.2429 14.2035 12.3636 13.3943L12.3775 13.3029C12.4595 12.7486 12.5971 12.4209 14.4622 12.1248C15.4097 11.9746 15.6589 12.3533 16.0043 12.8777C16.0425 12.9358 16.0807 12.9928 16.1198 13.0499C16.4479 13.5297 16.691 13.6394 17.0582 13.8064C17.2227 13.881 17.428 13.9751 17.7031 14.1314C18.3551 14.504 18.3551 14.9247 18.3551 15.8472V15.9518C18.3551 16.3434 18.3168 16.6872 18.2566 16.9859C19.3478 15.6185 20 13.8854 20 12C20 8.70089 18.003 5.8682 15.1519 4.64482C14.5987 5.01813 13.8398 5.54726 13.575 5.91C13.4396 6.09538 13.2482 7.04166 12.6257 7.11976C12.4626 7.14023 12.2438 7.12589 12.012 7.11097C11.3905 7.07058 10.5402 7.01606 10.268 7.75495C10.0952 8.2232 10.0648 9.49445 10.6239 10.1543C10.7134 10.2597 10.7307 10.4547 10.6699 10.6735C10.59 10.9608 10.4286 11.1356 10.3783 11.1717C10.2819 11.1163 10.0896 10.8931 9.95938 10.7412C9.64554 10.3765 9.25405 9.92233 8.74797 9.78176C8.56395 9.73083 8.36166 9.68867 8.16548 9.64736C7.6164 9.53227 6.99443 9.40134 6.84992 9.09302C6.74442 8.8672 6.74488 8.55621 6.74529 8.22764C6.74529 7.8112 6.74529 7.34029 6.54129 6.88256C6.46246 6.70541 6.35689 6.56446 6.23509 6.45329ZM12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z"></path></svg>

                        </>
                      )}
                    </span>


                  </div>
                </div>
                <h2>Click/Tap the image to hear audio.</h2>
                <div className="click_listen">
                  {currentBoxes.map((pos) => {
                    const handlePlayAudio = (audioId) => {
                      const audioElement = document.getElementById(audioId);
                      if (audioElement) {
                        audioElement.play();
                      }
                    };

                    return (
                      <div
                        className="click_img"
                        onClick={() => handlePlayAudio(pos._id)}
                        style={{ cursor: "pointer" }}
                        key={pos._id}
                      >
                        <img
                          src={
                            pos
                              ? `backendprojecr-production.up.railway.app/posts/${pos.postImage}`
                              : null
                          }
                          alt={`Image ${pos._id}`}
                        />
                        <audio
                          id={pos._id}
                          src={
                            pos
                              ? `backendprojecr-production.up.railway.app/posts/${pos.postAudio}`
                              : null
                          }
                        ></audio>
                        <p>{pos ? pos.word : null}</p>
                      </div>
                    );
                  })}
                </div>

                {/* أزرار التنقل المخصصة */}
                <div className="pagination-controls">
                  <button
                    onClick={() => handlePrev(post._id)}
                    disabled={currentPagee === 0}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <span>
                    {currentPagee + 1}/
                    {Math.ceil(post.boxes.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => handleNext(post._id)}
                    disabled={
                      (currentPagee + 1) * itemsPerPage >= post.boxes.length
                    }
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
                <div className="comment_lenght">
                  <p>Likes <span>{post.likes.length}</span></p>
                  <div className="comment_like">
                    <p>
                      Comments <span>{post.comments.length}</span>
                    </p>
                    <p>
                      shares
                    </p>
                  </div>
                </div>
                <div className="interaction">
                  <div className="inter">
                    {Relod_likee && Relod_likeeid === post._id ? (
                      <Relod_like />
                    ) : (

                      <div className="infotest" onClick={() => {
                        Likes(post._id);
                        setRelod_likeeid(post._id);
                      }}>
                        <svg

                          className={`inter-icon 
                      ${post.likes.includes(Mydata) ? "active_hart" : ""}`}
                          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3C19.5376 3 22 5.5 22 9C22 16 14.5 20 12 21.5C9.5 20 2 16 2 9C2 5.5 4.5 3 7.5 3C9.35997 3 11 4 12 5C13 4 14.64 3 16.5 3ZM12.9339 18.6038C13.8155 18.0485 14.61 17.4955 15.3549 16.9029C18.3337 14.533 20 11.9435 20 9C20 6.64076 18.463 5 16.5 5C15.4241 5 14.2593 5.56911 13.4142 6.41421L12 7.82843L10.5858 6.41421C9.74068 5.56911 8.5759 5 7.5 5C5.55906 5 4 6.6565 4 9C4 11.9435 5.66627 14.533 8.64514 16.9029C9.39 17.4955 10.1845 18.0485 11.0661 18.6038C11.3646 18.7919 11.6611 18.9729 12 19.1752C12.3389 18.9729 12.6354 18.7919 12.9339 18.6038Z"></path></svg>
                        <span>Like</span>
                      </div>
                    )}
                    <div className="infotest" onClick={() => {
                      handleCommentClick(post._id);
                      addNewQuestion_com();
                    }}>
                      <svg
                        className="inter-icon"

                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 3H14C18.4183 3 22 6.58172 22 11C22 15.4183 18.4183 19 14 19V22.5C9 20.5 2 17.5 2 11C2 6.58172 5.58172 3 10 3ZM12 17H14C17.3137 17 20 14.3137 20 11C20 7.68629 17.3137 5 14 5H10C6.68629 5 4 7.68629 4 11C4 14.61 6.46208 16.9656 12 19.4798V17Z"></path></svg>
                      <span>Comment</span>
                    </div>
                    <div className="infotest">
                      <svg className="inter-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 14H11C7.54202 14 4.53953 15.9502 3.03239 18.8107C3.01093 18.5433 3 18.2729 3 18C3 12.4772 7.47715 8 13 8V2.5L23.5 11L13 19.5V14ZM11 12H15V15.3078L20.3214 11L15 6.69224V10H13C10.5795 10 8.41011 11.0749 6.94312 12.7735C8.20873 12.2714 9.58041 12 11 12Z"></path></svg>
                      <span>Share</span>
                    </div>

                    {relod_Bookmark && bookMark === post._id ? (
                      <Loading_Bookmark />
                    ) : (
                      <div className="infotest" onClick={() => {
                        bookMarks(post._id);
                        handleBook(post._id);
                      }}>
                        <svg
                          className={`inter-icon  
        ${bookId && bookId.some((item) => item.post?._id === post._id)
                              ? "active_book"
                              : ""
                            }`}
                          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 2H19C19.5523 2 20 2.44772 20 3V22.1433C20 22.4194 19.7761 22.6434 19.5 22.6434C19.4061 22.6434 19.314 22.6168 19.2344 22.5669L12 18.0313L4.76559 22.5669C4.53163 22.7136 4.22306 22.6429 4.07637 22.4089C4.02647 22.3293 4 22.2373 4 22.1433V3C4 2.44772 4.44772 2 5 2ZM18 4H6V19.4324L12 15.6707L18 19.4324V4Z"></path></svg>
                        <span>Save</span>
                      </div>
                    )}
                  </div>
                </div>
                {showCommentForPostId === post._id && (
                  <div className="blore">
                    <div className="comments" ref={commentRef}>
                      <div className="publisher">
                        <FontAwesomeIcon
                          className="out_icon"
                          onClick={handleCloseComment}
                          icon={faTimes}
                        />
                        <p>
                          publication <span>{post.user.name}</span>
                        </p>
                      </div>
                      <div className="comment">
                        {post.comments.map((com, index) => (
                          <div key={index} className="com">
                            <img
                              src={
                                com.user_comment?.profilImage
                                  ? com.user_comment.profilImage.startsWith(
                                    "http"
                                  )
                                    ? com.user_comment.profilImage
                                    : `backendprojecr-production.up.railway.app/user/${com.user_comment.profilImage}`
                                  : "/image/pngegg.png"
                              }
                              alt={`Image of ${com.user_comment?.name || "user"
                                }`}
                            />

                            <div className="name_user_comment">
                              <span>{com.user_comment.name}</span>
                              <p style={{ whiteSpace: "pre-line" }}>
                                {com.comment}
                              </p>
                            </div>
                          </div>
                        ))}
                        {relod_coment ? <Loading_coment /> : null}
                      </div>
                      <form action="" onSubmit={(e) => Commentary(post._id, e)}>
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          ref={inputRef}
                        />
                        <button type="submit" onClick={addNewQuestion}>
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          } else if (post.type === "post_2") {
            return (
              <div key={index} className="all_bost choose_the_correct_answer">
                <div className="name_shoole">
                  <img
                    src={
                      post.user
                        ? `backendprojecr-production.up.railway.app/user/${post.user.profilImage}`
                        : "/image/pngegg.png"
                    }
                    alt={`Image of ${post.name}`}
                  />
                  <div className="date_shoole">
                    <p>{post.user ? post.user.name : null}{post?.user?.role === "employee" && (<svg className="documentation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.007 2.10377C8.60544 1.65006 7.08181 2.28116 6.41156 3.59306L5.60578 5.17023C5.51004 5.35763 5.35763 5.51004 5.17023 5.60578L3.59306 6.41156C2.28116 7.08181 1.65006 8.60544 2.10377 10.007L2.64923 11.692C2.71404 11.8922 2.71404 12.1078 2.64923 12.308L2.10377 13.993C1.65006 15.3946 2.28116 16.9182 3.59306 17.5885L5.17023 18.3942C5.35763 18.49 5.51004 18.6424 5.60578 18.8298L6.41156 20.407C7.08181 21.7189 8.60544 22.35 10.007 21.8963L11.692 21.3508C11.8922 21.286 12.1078 21.286 12.308 21.3508L13.993 21.8963C15.3946 22.35 16.9182 21.7189 17.5885 20.407L18.3942 18.8298C18.49 18.6424 18.6424 18.49 18.8298 18.3942L20.407 17.5885C21.7189 16.9182 22.35 15.3946 21.8963 13.993L21.3508 12.308C21.286 12.1078 21.286 11.8922 21.3508 11.692L21.8963 10.007C22.35 8.60544 21.7189 7.08181 20.407 6.41156L18.8298 5.60578C18.6424 5.51004 18.49 5.35763 18.3942 5.17023L17.5885 3.59306C16.9182 2.28116 15.3946 1.65006 13.993 2.10377L12.308 2.64923C12.1078 2.71403 11.8922 2.71404 11.692 2.64923L10.007 2.10377ZM6.75977 11.7573L8.17399 10.343L11.0024 13.1715L16.6593 7.51465L18.0735 8.92886L11.0024 15.9999L6.75977 11.7573Z"></path></svg>)} {post?.user?.role === "employee" && (<span className="type_user">Outstanding Student</span>)}</p>
                    <span>
                      {format(new Date(post.createdAt), "MMM dd, yyyy, hh:mm a")}
                      {post?.user?.role === "employee" && (
                        <>
                          <span>•</span>
                          <svg className="world" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.23509 6.45329C4.85101 7.89148 4 9.84636 4 12C4 16.4183 7.58172 20 12 20C13.0808 20 14.1116 19.7857 15.0521 19.3972C15.1671 18.6467 14.9148 17.9266 14.8116 17.6746C14.582 17.115 13.8241 16.1582 12.5589 14.8308C12.2212 14.4758 12.2429 14.2035 12.3636 13.3943L12.3775 13.3029C12.4595 12.7486 12.5971 12.4209 14.4622 12.1248C15.4097 11.9746 15.6589 12.3533 16.0043 12.8777C16.0425 12.9358 16.0807 12.9928 16.1198 13.0499C16.4479 13.5297 16.691 13.6394 17.0582 13.8064C17.2227 13.881 17.428 13.9751 17.7031 14.1314C18.3551 14.504 18.3551 14.9247 18.3551 15.8472V15.9518C18.3551 16.3434 18.3168 16.6872 18.2566 16.9859C19.3478 15.6185 20 13.8854 20 12C20 8.70089 18.003 5.8682 15.1519 4.64482C14.5987 5.01813 13.8398 5.54726 13.575 5.91C13.4396 6.09538 13.2482 7.04166 12.6257 7.11976C12.4626 7.14023 12.2438 7.12589 12.012 7.11097C11.3905 7.07058 10.5402 7.01606 10.268 7.75495C10.0952 8.2232 10.0648 9.49445 10.6239 10.1543C10.7134 10.2597 10.7307 10.4547 10.6699 10.6735C10.59 10.9608 10.4286 11.1356 10.3783 11.1717C10.2819 11.1163 10.0896 10.8931 9.95938 10.7412C9.64554 10.3765 9.25405 9.92233 8.74797 9.78176C8.56395 9.73083 8.36166 9.68867 8.16548 9.64736C7.6164 9.53227 6.99443 9.40134 6.84992 9.09302C6.74442 8.8672 6.74488 8.55621 6.74529 8.22764C6.74529 7.8112 6.74529 7.34029 6.54129 6.88256C6.46246 6.70541 6.35689 6.56446 6.23509 6.45329ZM12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z"></path></svg>

                        </>
                      )}
                    </span>


                  </div>
                </div>
                <div className="choose_answer">
                  <h2>Choose the correct answer!!!</h2>
                  {(() => {
                    if (!post || !post.questions) return null;

                    const questionsPerPage = 1;
                    const startIndex =
                      (pages[post._id] || 0) * questionsPerPage;
                    const endIndex = startIndex + questionsPerPage;
                    const visibleQuestions = post.questions.slice(
                      startIndex,
                      endIndex
                    );

                    const currentPage = pages[post._id] || 0;

                    const handlePrev = () => {
                      if (currentPage > 0) {
                        setPages((prev) => ({
                          ...prev,
                          [post._id]: currentPage - 1,
                        }));
                      }
                    };

                    const handleNext = () => {
                      const totalQuestions = post.questions.length;
                      if (
                        (currentPage + 1) * questionsPerPage <
                        totalQuestions
                      ) {
                        setPages((prev) => ({
                          ...prev,
                          [post._id]: currentPage + 1,
                        }));
                      }
                    };
                    const handleAnswer = (questionId, answer) => {
                      setLocalAnswers((prev) => ({
                        ...prev,
                        [questionId]: answer,
                      }));
                      chick_post_2(post._id, questionId, answer); // لازم نستناه
                    };

                    return (
                      <>
                        {visibleQuestions.map((res) => {
                          const solved = solvedPost_2?.find(
                            (p) => p.postId === post._id
                          );
                          const question = solved?.result.find(
                            (q) => q.questionId === res._id
                          );
                          const userAnswer = localAnswers[res._id];
                          const isCorrect = question?.isCorrect;
                          const correctAnswer = question?.correctAnswer; // اجابة السيرفر الصحيحة
                          const isAnswered = isCorrect !== undefined;

                          return (
                            <div className="qustion_choose" key={res._id}>
                              <h3>{res.question}</h3>

                              {[
                                "Answer_1",
                                "Answer_2",
                                "Answer_3",
                                "Answer_4",
                              ].map((key, idx) => {
                                const answerText = res[key];
                                let answerClass = "answer";

                                if (isAnswered) {
                                  if (answerText === correctAnswer) {
                                    answerClass += " active_true";
                                  } else {
                                    answerClass += " active_false";
                                  }
                                }
                                return (
                                  <div key={idx}>
                                    <div
                                      className={answerClass}
                                      onClick={() => {
                                        if (!isAnswered) {
                                          setid(res._id);
                                          setrelod(true);
                                          handleAnswer(res._id, answerText);
                                          setlod(!lod);
                                        }
                                      }}
                                    >
                                      <p>
                                        {String.fromCharCode(65 + idx)}-{" "}
                                        {answerText}
                                      </p>
                                      {relod && id === res._id ? (
                                        <Relod_post />
                                      ) : null}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}

                        <div className="pagination-controls">
                          <button
                            onClick={handlePrev}
                            disabled={currentPage === 0}
                          >
                            <FontAwesomeIcon icon={faChevronLeft} />
                          </button>
                          <span>
                            {currentPage + 1}/
                            {Math.ceil(
                              post.questions.length / questionsPerPage
                            )}
                          </span>
                          <button
                            onClick={handleNext}
                            disabled={
                              (currentPage + 1) * questionsPerPage >=
                              post.questions.length
                            }
                          >
                            <FontAwesomeIcon icon={faChevronRight} />
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="comment_lenght">
                  <p>Likes <span>{post.likes.length}</span></p>
                  <div className="comment_like">
                    <p>
                      Comments <span>{post.comments.length}</span>
                    </p>
                    <p>
                      shares
                    </p>
                  </div>
                </div>
                     <div className="interaction">
                  <div className="inter">
                    {Relod_likee && Relod_likeeid === post._id ? (
                      <Relod_like />
                    ) : (

                      <div className="infotest" onClick={() => {
                        Likes(post._id);
                        setRelod_likeeid(post._id);
                      }}>
                        <svg

                          className={`inter-icon 
                      ${post.likes.includes(Mydata) ? "active_hart" : ""}`}
                          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3C19.5376 3 22 5.5 22 9C22 16 14.5 20 12 21.5C9.5 20 2 16 2 9C2 5.5 4.5 3 7.5 3C9.35997 3 11 4 12 5C13 4 14.64 3 16.5 3ZM12.9339 18.6038C13.8155 18.0485 14.61 17.4955 15.3549 16.9029C18.3337 14.533 20 11.9435 20 9C20 6.64076 18.463 5 16.5 5C15.4241 5 14.2593 5.56911 13.4142 6.41421L12 7.82843L10.5858 6.41421C9.74068 5.56911 8.5759 5 7.5 5C5.55906 5 4 6.6565 4 9C4 11.9435 5.66627 14.533 8.64514 16.9029C9.39 17.4955 10.1845 18.0485 11.0661 18.6038C11.3646 18.7919 11.6611 18.9729 12 19.1752C12.3389 18.9729 12.6354 18.7919 12.9339 18.6038Z"></path></svg>
                        <span>Like</span>
                      </div>
                    )}
                    <div className="infotest" onClick={() => {
                      handleCommentClick(post._id);
                      addNewQuestion_com();
                    }}>
                      <svg
                        className="inter-icon"

                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 3H14C18.4183 3 22 6.58172 22 11C22 15.4183 18.4183 19 14 19V22.5C9 20.5 2 17.5 2 11C2 6.58172 5.58172 3 10 3ZM12 17H14C17.3137 17 20 14.3137 20 11C20 7.68629 17.3137 5 14 5H10C6.68629 5 4 7.68629 4 11C4 14.61 6.46208 16.9656 12 19.4798V17Z"></path></svg>
                      <span>Comment</span>
                    </div>
                    <div className="infotest">
                      <svg className="inter-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 14H11C7.54202 14 4.53953 15.9502 3.03239 18.8107C3.01093 18.5433 3 18.2729 3 18C3 12.4772 7.47715 8 13 8V2.5L23.5 11L13 19.5V14ZM11 12H15V15.3078L20.3214 11L15 6.69224V10H13C10.5795 10 8.41011 11.0749 6.94312 12.7735C8.20873 12.2714 9.58041 12 11 12Z"></path></svg>
                      <span>Share</span>
                    </div>

                    {relod_Bookmark && bookMark === post._id ? (
                      <Loading_Bookmark />
                    ) : (
                      <div className="infotest" onClick={() => {
                        bookMarks(post._id);
                        handleBook(post._id);
                      }}>
                        <svg
                          className={`inter-icon  
        ${bookId && bookId.some((item) => item.post?._id === post._id)
                              ? "active_book"
                              : ""
                            }`}
                          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 2H19C19.5523 2 20 2.44772 20 3V22.1433C20 22.4194 19.7761 22.6434 19.5 22.6434C19.4061 22.6434 19.314 22.6168 19.2344 22.5669L12 18.0313L4.76559 22.5669C4.53163 22.7136 4.22306 22.6429 4.07637 22.4089C4.02647 22.3293 4 22.2373 4 22.1433V3C4 2.44772 4.44772 2 5 2ZM18 4H6V19.4324L12 15.6707L18 19.4324V4Z"></path></svg>
                        <span>Save</span>
                      </div>
                    )}
                  </div>
                </div>
                {showCommentForPostId === post._id && (
                  <div className="blore">
                    <div className="comments" ref={commentRef}>
                      <div className="publisher">
                        <FontAwesomeIcon
                          className="out_icon"
                          onClick={handleCloseComment}
                          icon={faTimes}
                        />
                        <p>
                          publication <span>{post.user.name}</span>
                        </p>
                      </div>
                      <div className="comment">
                        {post.comments.map((com, index) => (
                          <div key={index} className="com">
                            <img
                              src={
                                com.user_comment?.profilImage
                                  ? com.user_comment.profilImage.startsWith(
                                    "http"
                                  )
                                    ? com.user_comment.profilImage
                                    : `backendprojecr-production.up.railway.app/user/${com.user_comment.profilImage}`
                                  : "/image/pngegg.png"
                              }
                              alt={`Image of ${com.user_comment?.name || "user"
                                }`}
                            />

                            <div className="name_user_comment">
                              <span>{com.user_comment?.name}</span>
                              <p style={{ whiteSpace: "pre-line" }}>
                                {com?.comment}
                              </p>
                            </div>
                          </div>
                        ))}
                        {relod_coment ? <Loading_coment /> : null}
                      </div>
                      <form action="" onSubmit={(e) => Commentary(post._id, e)}>
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          ref={inputRef}
                        />
                        <button type="submit" onClick={addNewQuestion}>
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          } else if (post.type === "post_3") {
            return (
              <div key={index} className="all_bost bost_true_or-false posts3">
                <div className="name_shoole">
                  <img
                    src={
                      post.user
                        ? `backendprojecr-production.up.railway.app/user/${post.user.profilImage}`
                        : "/image/pngegg.png"
                    }
                    alt=""
                  />
                  <div className="date_shoole">
                    <p>{post.user ? post.user.name : null}{post?.user?.role === "employee" && (<svg className="documentation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.007 2.10377C8.60544 1.65006 7.08181 2.28116 6.41156 3.59306L5.60578 5.17023C5.51004 5.35763 5.35763 5.51004 5.17023 5.60578L3.59306 6.41156C2.28116 7.08181 1.65006 8.60544 2.10377 10.007L2.64923 11.692C2.71404 11.8922 2.71404 12.1078 2.64923 12.308L2.10377 13.993C1.65006 15.3946 2.28116 16.9182 3.59306 17.5885L5.17023 18.3942C5.35763 18.49 5.51004 18.6424 5.60578 18.8298L6.41156 20.407C7.08181 21.7189 8.60544 22.35 10.007 21.8963L11.692 21.3508C11.8922 21.286 12.1078 21.286 12.308 21.3508L13.993 21.8963C15.3946 22.35 16.9182 21.7189 17.5885 20.407L18.3942 18.8298C18.49 18.6424 18.6424 18.49 18.8298 18.3942L20.407 17.5885C21.7189 16.9182 22.35 15.3946 21.8963 13.993L21.3508 12.308C21.286 12.1078 21.286 11.8922 21.3508 11.692L21.8963 10.007C22.35 8.60544 21.7189 7.08181 20.407 6.41156L18.8298 5.60578C18.6424 5.51004 18.49 5.35763 18.3942 5.17023L17.5885 3.59306C16.9182 2.28116 15.3946 1.65006 13.993 2.10377L12.308 2.64923C12.1078 2.71403 11.8922 2.71404 11.692 2.64923L10.007 2.10377ZM6.75977 11.7573L8.17399 10.343L11.0024 13.1715L16.6593 7.51465L18.0735 8.92886L11.0024 15.9999L6.75977 11.7573Z"></path></svg>)} {post?.user?.role === "employee" && (<span className="type_user">Outstanding Student</span>)}</p>
                    <span>
                      {format(new Date(post.createdAt), "MMM dd, yyyy, hh:mm a")}
                      {post?.user?.role === "employee" && (
                        <>
                          <span>•</span>
                          <svg className="world" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.23509 6.45329C4.85101 7.89148 4 9.84636 4 12C4 16.4183 7.58172 20 12 20C13.0808 20 14.1116 19.7857 15.0521 19.3972C15.1671 18.6467 14.9148 17.9266 14.8116 17.6746C14.582 17.115 13.8241 16.1582 12.5589 14.8308C12.2212 14.4758 12.2429 14.2035 12.3636 13.3943L12.3775 13.3029C12.4595 12.7486 12.5971 12.4209 14.4622 12.1248C15.4097 11.9746 15.6589 12.3533 16.0043 12.8777C16.0425 12.9358 16.0807 12.9928 16.1198 13.0499C16.4479 13.5297 16.691 13.6394 17.0582 13.8064C17.2227 13.881 17.428 13.9751 17.7031 14.1314C18.3551 14.504 18.3551 14.9247 18.3551 15.8472V15.9518C18.3551 16.3434 18.3168 16.6872 18.2566 16.9859C19.3478 15.6185 20 13.8854 20 12C20 8.70089 18.003 5.8682 15.1519 4.64482C14.5987 5.01813 13.8398 5.54726 13.575 5.91C13.4396 6.09538 13.2482 7.04166 12.6257 7.11976C12.4626 7.14023 12.2438 7.12589 12.012 7.11097C11.3905 7.07058 10.5402 7.01606 10.268 7.75495C10.0952 8.2232 10.0648 9.49445 10.6239 10.1543C10.7134 10.2597 10.7307 10.4547 10.6699 10.6735C10.59 10.9608 10.4286 11.1356 10.3783 11.1717C10.2819 11.1163 10.0896 10.8931 9.95938 10.7412C9.64554 10.3765 9.25405 9.92233 8.74797 9.78176C8.56395 9.73083 8.36166 9.68867 8.16548 9.64736C7.6164 9.53227 6.99443 9.40134 6.84992 9.09302C6.74442 8.8672 6.74488 8.55621 6.74529 8.22764C6.74529 7.8112 6.74529 7.34029 6.54129 6.88256C6.46246 6.70541 6.35689 6.56446 6.23509 6.45329ZM12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z"></path></svg>

                        </>
                      )}
                    </span>


                  </div>
                </div>
                <h2>True or false.</h2>
                {(() => {
                  if (!post || !post.questions) return null;

                  // لتخزين الأيقونات النشطة لكل سؤال
                  const questionsPerPage = 5;
                  const startIndex = (pages[post._id] || 0) * questionsPerPage;
                  const endIndex = startIndex + questionsPerPage;
                  const visibleQuestions = post.questions.slice(
                    startIndex,
                    endIndex
                  );

                  const currentPage = pages[post._id] || 0;

                  const handlePrev = () => {
                    const currentPage = pages[post._id] || 0;
                    if (currentPage > 0) {
                      setPages((prev) => ({
                        ...prev,
                        [post._id]: currentPage - 1,
                      }));
                    }
                  };

                  const handleNext = () => {
                    const current = pages[post._id] || 0;
                    const totalQuestions = post.questions.length;

                    if ((current + 1) * questionsPerPage < totalQuestions) {
                      setPages((prev) => ({
                        ...prev,
                        [post._id]: current + 1,
                      }));
                    }
                  };

                  const toggleActiveIcon = (questionId, iconType) => {
                    setActiveIcon((prev) => ({
                      ...prev,
                      [questionId]: iconType,
                    }));
                  };
                  const handleAnswer = (questionId, answer) => {
                    // تخزين الإجابة مؤقتاً
                    setLocalAnswers((prev) => ({
                      ...prev,
                      [questionId]: answer,
                    }));

                    // إرسال الإجابة للسيرفر
                    chick_post_3(post._id, questionId, answer ? true : false);
                  };

                  return (
                    <>
                      {visibleQuestions.map((item, index) => {
                        const solved = solvedPost_3?.find(
                          (p) => p.postId === post._id
                        );
                        const question = solved?.result.find(
                          (q) => q.questionId === item._id
                        );

                        // const local = localAnswers[item._id];
                        const isCorrect = question?.isCorrect;

                        // أول شيء الكلاس:
                        const answerClass =
                          isCorrect !== undefined
                            ? `que_tr_or_fa ${isCorrect ? "active_true" : "active_false"
                            }`
                            : "que_tr_or_fa";

                        const iconClass =
                          isCorrect !== undefined
                            ? `icon_true_or_false ${isCorrect ? "iconnone" : "iconnone"
                            }`
                            : "icon_true_or_false";

                        return (
                          <div className="true_or_false" key={item._id}>
                            <div className={answerClass}>
                              <p>{item.question}</p>
                              {relod && id === item._id ? (
                                <Relod_post />
                              ) : (
                                <div className={iconClass}>
                                  <FontAwesomeIcon
                                    icon={faTimes}
                                    className="error-icon"
                                    onClick={() => {
                                      setid(item._id);
                                      setrelod(true);
                                      toggleActiveIcon(item._id, "error");
                                      handleAnswer(item._id, false);
                                      setlod(!lod);
                                    }}
                                  />
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    className="check-icon"
                                    onClick={() => {
                                      setid(item._id);
                                      setrelod(true);
                                      toggleActiveIcon(item._id, "check");
                                      handleAnswer(item._id, true);
                                      setlod(!lod);
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      <div className="pagination-controls">
                        <button
                          onClick={handlePrev}
                          disabled={currentPage === 0}
                        >
                          <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <span>
                          {currentPage + 1}/
                          {Math.ceil(post.questions.length / questionsPerPage)}
                        </span>
                        <button
                          onClick={handleNext}
                          disabled={
                            (currentPage + 1) * questionsPerPage >=
                            post.questions.length
                          }
                        >
                          <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                      </div>
                    </>
                  );
                })()}
                <div className="comment_lenght">
                  <p>Likes <span>{post.likes.length}</span></p>
                  <div className="comment_like">
                    <p>
                      Comments <span>{post.comments.length}</span>
                    </p>
                    <p>
                      shares
                    </p>
                  </div>
                </div>
               <div className="interaction">
                  <div className="inter">
                    {Relod_likee && Relod_likeeid === post._id ? (
                      <Relod_like />
                    ) : (

                      <div className="infotest" onClick={() => {
                        Likes(post._id);
                        setRelod_likeeid(post._id);
                      }}>
                        <svg

                          className={`inter-icon 
                      ${post.likes.includes(Mydata) ? "active_hart" : ""}`}
                          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3C19.5376 3 22 5.5 22 9C22 16 14.5 20 12 21.5C9.5 20 2 16 2 9C2 5.5 4.5 3 7.5 3C9.35997 3 11 4 12 5C13 4 14.64 3 16.5 3ZM12.9339 18.6038C13.8155 18.0485 14.61 17.4955 15.3549 16.9029C18.3337 14.533 20 11.9435 20 9C20 6.64076 18.463 5 16.5 5C15.4241 5 14.2593 5.56911 13.4142 6.41421L12 7.82843L10.5858 6.41421C9.74068 5.56911 8.5759 5 7.5 5C5.55906 5 4 6.6565 4 9C4 11.9435 5.66627 14.533 8.64514 16.9029C9.39 17.4955 10.1845 18.0485 11.0661 18.6038C11.3646 18.7919 11.6611 18.9729 12 19.1752C12.3389 18.9729 12.6354 18.7919 12.9339 18.6038Z"></path></svg>
                        <span>Like</span>
                      </div>
                    )}
                    <div className="infotest" onClick={() => {
                      handleCommentClick(post._id);
                      addNewQuestion_com();
                    }}>
                      <svg
                        className="inter-icon"

                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 3H14C18.4183 3 22 6.58172 22 11C22 15.4183 18.4183 19 14 19V22.5C9 20.5 2 17.5 2 11C2 6.58172 5.58172 3 10 3ZM12 17H14C17.3137 17 20 14.3137 20 11C20 7.68629 17.3137 5 14 5H10C6.68629 5 4 7.68629 4 11C4 14.61 6.46208 16.9656 12 19.4798V17Z"></path></svg>
                      <span>Comment</span>
                    </div>
                    <div className="infotest">
                      <svg className="inter-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 14H11C7.54202 14 4.53953 15.9502 3.03239 18.8107C3.01093 18.5433 3 18.2729 3 18C3 12.4772 7.47715 8 13 8V2.5L23.5 11L13 19.5V14ZM11 12H15V15.3078L20.3214 11L15 6.69224V10H13C10.5795 10 8.41011 11.0749 6.94312 12.7735C8.20873 12.2714 9.58041 12 11 12Z"></path></svg>
                      <span>Share</span>
                    </div>

                    {relod_Bookmark && bookMark === post._id ? (
                      <Loading_Bookmark />
                    ) : (
                      <div className="infotest" onClick={() => {
                        bookMarks(post._id);
                        handleBook(post._id);
                      }}>
                        <svg
                          className={`inter-icon  
        ${bookId && bookId.some((item) => item.post?._id === post._id)
                              ? "active_book"
                              : ""
                            }`}
                          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 2H19C19.5523 2 20 2.44772 20 3V22.1433C20 22.4194 19.7761 22.6434 19.5 22.6434C19.4061 22.6434 19.314 22.6168 19.2344 22.5669L12 18.0313L4.76559 22.5669C4.53163 22.7136 4.22306 22.6429 4.07637 22.4089C4.02647 22.3293 4 22.2373 4 22.1433V3C4 2.44772 4.44772 2 5 2ZM18 4H6V19.4324L12 15.6707L18 19.4324V4Z"></path></svg>
                        <span>Save</span>
                      </div>
                    )}
                  </div>
                </div>
                {showCommentForPostId === post._id && (
                  <div className="blore">
                    <div className="comments" ref={commentRef}>
                      <div className="publisher">
                        <FontAwesomeIcon
                          className="out_icon"
                          onClick={handleCloseComment}
                          icon={faTimes}
                        />
                        <p>
                          publication <span>{post.user.name}</span>
                        </p>
                      </div>
                      <div className="comment">
                        {post.comments.map((com, index) => (
                          <div key={index} className="com">
                            <img
                              src={
                                com.user_comment?.profilImage
                                  ? com.user_comment.profilImage.startsWith(
                                    "http"
                                  )
                                    ? com.user_comment.profilImage
                                    : `backendprojecr-production.up.railway.app/user/${com.user_comment.profilImage}`
                                  : "/image/pngegg.png"
                              }
                              alt={`Image of ${com.user_comment?.name || "user"
                                }`}
                            />

                            <div className="name_user_comment">
                              <span>{com.user_comment.name}</span>
                              <p style={{ whiteSpace: "pre-line" }}>
                                {com.comment}
                              </p>
                            </div>
                          </div>
                        ))}
                        {relod_coment ? <Loading_coment /> : null}
                      </div>
                      <form action="" onSubmit={(e) => Commentary(post._id, e)}>
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          ref={inputRef}
                        />
                        <button type="submit" onClick={addNewQuestion}>
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          } else if (post.type === "post_4") {
            return (
              <div key={index} className="all_bost image_and_answer posts4">
                <div className="name_shoole">
                  <img
                    src={
                      post.user
                        ? `backendprojecr-production.up.railway.app/user/${post.user.profilImage}`
                        : "/image/pngegg.png"
                    }
                    alt=""
                  />
                  <div className="date_shoole">
                    <p>{post.user ? post.user.name : null}{post?.user?.role === "employee" && (<svg className="documentation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.007 2.10377C8.60544 1.65006 7.08181 2.28116 6.41156 3.59306L5.60578 5.17023C5.51004 5.35763 5.35763 5.51004 5.17023 5.60578L3.59306 6.41156C2.28116 7.08181 1.65006 8.60544 2.10377 10.007L2.64923 11.692C2.71404 11.8922 2.71404 12.1078 2.64923 12.308L2.10377 13.993C1.65006 15.3946 2.28116 16.9182 3.59306 17.5885L5.17023 18.3942C5.35763 18.49 5.51004 18.6424 5.60578 18.8298L6.41156 20.407C7.08181 21.7189 8.60544 22.35 10.007 21.8963L11.692 21.3508C11.8922 21.286 12.1078 21.286 12.308 21.3508L13.993 21.8963C15.3946 22.35 16.9182 21.7189 17.5885 20.407L18.3942 18.8298C18.49 18.6424 18.6424 18.49 18.8298 18.3942L20.407 17.5885C21.7189 16.9182 22.35 15.3946 21.8963 13.993L21.3508 12.308C21.286 12.1078 21.286 11.8922 21.3508 11.692L21.8963 10.007C22.35 8.60544 21.7189 7.08181 20.407 6.41156L18.8298 5.60578C18.6424 5.51004 18.49 5.35763 18.3942 5.17023L17.5885 3.59306C16.9182 2.28116 15.3946 1.65006 13.993 2.10377L12.308 2.64923C12.1078 2.71403 11.8922 2.71404 11.692 2.64923L10.007 2.10377ZM6.75977 11.7573L8.17399 10.343L11.0024 13.1715L16.6593 7.51465L18.0735 8.92886L11.0024 15.9999L6.75977 11.7573Z"></path></svg>)} {post?.user?.role === "employee" && (<span className="type_user">Outstanding Student</span>)}</p>
                    <span>
                      {format(new Date(post.createdAt), "MMM dd, yyyy, hh:mm a")}
                      {post?.user?.role === "employee" && (
                        <>
                          <span>•</span>
                          <svg className="world" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.23509 6.45329C4.85101 7.89148 4 9.84636 4 12C4 16.4183 7.58172 20 12 20C13.0808 20 14.1116 19.7857 15.0521 19.3972C15.1671 18.6467 14.9148 17.9266 14.8116 17.6746C14.582 17.115 13.8241 16.1582 12.5589 14.8308C12.2212 14.4758 12.2429 14.2035 12.3636 13.3943L12.3775 13.3029C12.4595 12.7486 12.5971 12.4209 14.4622 12.1248C15.4097 11.9746 15.6589 12.3533 16.0043 12.8777C16.0425 12.9358 16.0807 12.9928 16.1198 13.0499C16.4479 13.5297 16.691 13.6394 17.0582 13.8064C17.2227 13.881 17.428 13.9751 17.7031 14.1314C18.3551 14.504 18.3551 14.9247 18.3551 15.8472V15.9518C18.3551 16.3434 18.3168 16.6872 18.2566 16.9859C19.3478 15.6185 20 13.8854 20 12C20 8.70089 18.003 5.8682 15.1519 4.64482C14.5987 5.01813 13.8398 5.54726 13.575 5.91C13.4396 6.09538 13.2482 7.04166 12.6257 7.11976C12.4626 7.14023 12.2438 7.12589 12.012 7.11097C11.3905 7.07058 10.5402 7.01606 10.268 7.75495C10.0952 8.2232 10.0648 9.49445 10.6239 10.1543C10.7134 10.2597 10.7307 10.4547 10.6699 10.6735C10.59 10.9608 10.4286 11.1356 10.3783 11.1717C10.2819 11.1163 10.0896 10.8931 9.95938 10.7412C9.64554 10.3765 9.25405 9.92233 8.74797 9.78176C8.56395 9.73083 8.36166 9.68867 8.16548 9.64736C7.6164 9.53227 6.99443 9.40134 6.84992 9.09302C6.74442 8.8672 6.74488 8.55621 6.74529 8.22764C6.74529 7.8112 6.74529 7.34029 6.54129 6.88256C6.46246 6.70541 6.35689 6.56446 6.23509 6.45329ZM12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z"></path></svg>

                        </>
                      )}
                    </span>


                  </div>
                </div>
                {(() => {
                  if (!post || !post.questions) return null;

                  const questionsPerPage = 1;
                  const currentPage = questionIndices[post._id] || 0;

                  const startIndex = currentPage * questionsPerPage;
                  const endIndex = startIndex + questionsPerPage;
                  const visibleQuestions = post.questions.slice(
                    startIndex,
                    endIndex
                  );

                  const handlePrev = () => {
                    if (currentPage > 0) {
                      setQuestionIndices((prev) => ({
                        ...prev,
                        [post._id]: currentPage - 1,
                      }));
                    }
                  };

                  const handleNext = () => {
                    const totalQuestions = post.questions.length;
                    if ((currentPage + 1) * questionsPerPage < totalQuestions) {
                      setQuestionIndices((prev) => ({
                        ...prev,
                        [post._id]: currentPage + 1,
                      }));
                    }
                  };

                  const handleAnswer = (questionId, answer) => {
                    setLocalAnswers((prev) => ({
                      ...prev,
                      [questionId]: answer,
                    }));
                    chick_post_4(post._id, questionId, answer);
                  };

                  return (
                    <>
                      {visibleQuestions.map((item) => {
                        const solved = solvedPost_4?.find(
                          (p) => p.postId === post._id
                        );
                        const question = solved?.result.find(
                          (q) => q.questionId === item._id
                        );

                        const userAnswer = localAnswers[item._id];
                        const isCorrect = question?.isCorrect;
                        const correctAnswer = question?.correctAnswer;
                        const isAnswered = isCorrect !== undefined;

                        return (
                          <div className="image_answer" key={item._id}>
                            {item.question ? <h2>{item.question}</h2> : null}

                            <div className="img_ans">
                              <img
                                src={`backendprojecr-production.up.railway.app/posts/${item.img}`}
                                alt="Question"
                              />
                              <div className="anwser">
                                {["word_1", "word_2", "word_3", "word_4"].map(
                                  (key, idx) => {
                                    const word = item[key];

                                    let answerClass = "testans";

                                    if (isAnswered) {
                                      if (word === correctAnswer) {
                                        answerClass += " active_true";
                                      } else {
                                        answerClass += " active_false";
                                      }
                                    }

                                    return (
                                      <div
                                        key={idx}
                                        className={answerClass}
                                        onClick={() => {
                                          if (!isAnswered) {
                                            setid(item._id);
                                            setrelod(true);
                                            handleAnswer(item._id, word);
                                            setlod(!lod);
                                          }
                                        }}
                                      >
                                        {String.fromCharCode(65 + idx)}- {word}
                                        {relod && id === item._id ? (
                                          <Relod_post />
                                        ) : null}
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div className="pagination-controls">
                        <button
                          onClick={handlePrev}
                          disabled={currentPage === 0}
                        >
                          <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <span>
                          {currentPage + 1}/
                          {Math.ceil(post.questions.length / questionsPerPage)}
                        </span>
                        <button
                          onClick={handleNext}
                          disabled={
                            (currentPage + 1) * questionsPerPage >=
                            post.questions.length
                          }
                        >
                          <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                      </div>
                    </>
                  );
                })()}

                <div className="comment_lenght">
                  <p>Likes <span>{post.likes.length}</span></p>
                  <div className="comment_like">
                    <p>
                      Comments <span>{post.comments.length}</span>
                    </p>
                    <p>
                      shares
                    </p>
                  </div>
                </div>
                <div className="interaction">
                  <div className="inter">
                    {Relod_likee && Relod_likeeid === post._id ? (
                      <Relod_like />
                    ) : (

                      <div className="infotest" onClick={() => {
                        Likes(post._id);
                        setRelod_likeeid(post._id);
                      }}>
                        <svg

                          className={`inter-icon 
                      ${post.likes.includes(Mydata) ? "active_hart" : ""}`}
                          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3C19.5376 3 22 5.5 22 9C22 16 14.5 20 12 21.5C9.5 20 2 16 2 9C2 5.5 4.5 3 7.5 3C9.35997 3 11 4 12 5C13 4 14.64 3 16.5 3ZM12.9339 18.6038C13.8155 18.0485 14.61 17.4955 15.3549 16.9029C18.3337 14.533 20 11.9435 20 9C20 6.64076 18.463 5 16.5 5C15.4241 5 14.2593 5.56911 13.4142 6.41421L12 7.82843L10.5858 6.41421C9.74068 5.56911 8.5759 5 7.5 5C5.55906 5 4 6.6565 4 9C4 11.9435 5.66627 14.533 8.64514 16.9029C9.39 17.4955 10.1845 18.0485 11.0661 18.6038C11.3646 18.7919 11.6611 18.9729 12 19.1752C12.3389 18.9729 12.6354 18.7919 12.9339 18.6038Z"></path></svg>
                        <span>Like</span>
                      </div>
                    )}
                    <div className="infotest" onClick={() => {
                      handleCommentClick(post._id);
                      addNewQuestion_com();
                    }}>
                      <svg
                        className="inter-icon"

                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 3H14C18.4183 3 22 6.58172 22 11C22 15.4183 18.4183 19 14 19V22.5C9 20.5 2 17.5 2 11C2 6.58172 5.58172 3 10 3ZM12 17H14C17.3137 17 20 14.3137 20 11C20 7.68629 17.3137 5 14 5H10C6.68629 5 4 7.68629 4 11C4 14.61 6.46208 16.9656 12 19.4798V17Z"></path></svg>
                      <span>Comment</span>
                    </div>
                    <div className="infotest">
                      <svg className="inter-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 14H11C7.54202 14 4.53953 15.9502 3.03239 18.8107C3.01093 18.5433 3 18.2729 3 18C3 12.4772 7.47715 8 13 8V2.5L23.5 11L13 19.5V14ZM11 12H15V15.3078L20.3214 11L15 6.69224V10H13C10.5795 10 8.41011 11.0749 6.94312 12.7735C8.20873 12.2714 9.58041 12 11 12Z"></path></svg>
                      <span>Share</span>
                    </div>

                    {relod_Bookmark && bookMark === post._id ? (
                      <Loading_Bookmark />
                    ) : (
                      <div className="infotest" onClick={() => {
                        bookMarks(post._id);
                        handleBook(post._id);
                      }}>
                        <svg
                          className={`inter-icon  
        ${bookId && bookId.some((item) => item.post?._id === post._id)
                              ? "active_book"
                              : ""
                            }`}
                          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 2H19C19.5523 2 20 2.44772 20 3V22.1433C20 22.4194 19.7761 22.6434 19.5 22.6434C19.4061 22.6434 19.314 22.6168 19.2344 22.5669L12 18.0313L4.76559 22.5669C4.53163 22.7136 4.22306 22.6429 4.07637 22.4089C4.02647 22.3293 4 22.2373 4 22.1433V3C4 2.44772 4.44772 2 5 2ZM18 4H6V19.4324L12 15.6707L18 19.4324V4Z"></path></svg>
                        <span>Save</span>
                      </div>
                    )}
                  </div>
                </div>

                {showCommentForPostId === post._id && (
                  <div className="blore">
                    <div className="comments" ref={commentRef}>
                      <div className="publisher">
                        <FontAwesomeIcon
                          className="out_icon"
                          onClick={handleCloseComment}
                          icon={faTimes}
                        />
                        <p>
                          publication <span>{post.user.name}</span>
                        </p>
                      </div>
                      <div className="comment">
                        {post.comments.map((com, index) => (
                          <div key={index} className="com">
                            <img
                              src={
                                com.user_comment?.profilImage
                                  ? com.user_comment.profilImage.startsWith(
                                    "http"
                                  )
                                    ? com.user_comment.profilImage
                                    : `backendprojecr-production.up.railway.app/user/${com.user_comment.profilImage}`
                                  : "/image/pngegg.png"
                              }
                              alt={`Image of ${com.user_comment?.name || "user"
                                }`}
                            />

                            <div className="name_user_comment">
                              <span>{com.user_comment.name}</span>
                              <p style={{ whiteSpace: "pre-line" }}>
                                {com.comment}
                              </p>
                            </div>
                          </div>
                        ))}
                        {relod_coment ? <Loading_coment /> : null}
                      </div>
                      <form action="" onSubmit={(e) => Commentary(post._id, e)}>
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          ref={inputRef}
                        />
                        <button type="submit" onClick={addNewQuestion}>
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          } else if (post.type === "post_5") {
            return (
              <div key={index} className="all_bost video_img_word posts4">
                <div className="name_shoole">
<img
  src={
    post.user
      ? post.user.profilImage.startsWith("http")
        ? post.user.profilImage
        : `backendprojecr-production.up.railway.app/user/${post.user.profilImage}`
      : "/image/pngegg.png"
  }
  alt={`Image of ${post.user.name}`}
/>
                  <div className="date_shoole">
                    <p>{post.user ? post.user.name : null}{post?.user?.role === "employee" && (<svg className="documentation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.007 2.10377C8.60544 1.65006 7.08181 2.28116 6.41156 3.59306L5.60578 5.17023C5.51004 5.35763 5.35763 5.51004 5.17023 5.60578L3.59306 6.41156C2.28116 7.08181 1.65006 8.60544 2.10377 10.007L2.64923 11.692C2.71404 11.8922 2.71404 12.1078 2.64923 12.308L2.10377 13.993C1.65006 15.3946 2.28116 16.9182 3.59306 17.5885L5.17023 18.3942C5.35763 18.49 5.51004 18.6424 5.60578 18.8298L6.41156 20.407C7.08181 21.7189 8.60544 22.35 10.007 21.8963L11.692 21.3508C11.8922 21.286 12.1078 21.286 12.308 21.3508L13.993 21.8963C15.3946 22.35 16.9182 21.7189 17.5885 20.407L18.3942 18.8298C18.49 18.6424 18.6424 18.49 18.8298 18.3942L20.407 17.5885C21.7189 16.9182 22.35 15.3946 21.8963 13.993L21.3508 12.308C21.286 12.1078 21.286 11.8922 21.3508 11.692L21.8963 10.007C22.35 8.60544 21.7189 7.08181 20.407 6.41156L18.8298 5.60578C18.6424 5.51004 18.49 5.35763 18.3942 5.17023L17.5885 3.59306C16.9182 2.28116 15.3946 1.65006 13.993 2.10377L12.308 2.64923C12.1078 2.71403 11.8922 2.71404 11.692 2.64923L10.007 2.10377ZM6.75977 11.7573L8.17399 10.343L11.0024 13.1715L16.6593 7.51465L18.0735 8.92886L11.0024 15.9999L6.75977 11.7573Z"></path></svg>)} {post?.user?.role === "employee" && (<span className="type_user">Outstanding Student</span>)}</p>
                    <span>
                      {format(new Date(post.createdAt), "MMM dd, yyyy, hh:mm a")}
                      {post?.user?.role === "employee" && (
                        <>
                          <span>•</span>
                          <svg className="world" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.23509 6.45329C4.85101 7.89148 4 9.84636 4 12C4 16.4183 7.58172 20 12 20C13.0808 20 14.1116 19.7857 15.0521 19.3972C15.1671 18.6467 14.9148 17.9266 14.8116 17.6746C14.582 17.115 13.8241 16.1582 12.5589 14.8308C12.2212 14.4758 12.2429 14.2035 12.3636 13.3943L12.3775 13.3029C12.4595 12.7486 12.5971 12.4209 14.4622 12.1248C15.4097 11.9746 15.6589 12.3533 16.0043 12.8777C16.0425 12.9358 16.0807 12.9928 16.1198 13.0499C16.4479 13.5297 16.691 13.6394 17.0582 13.8064C17.2227 13.881 17.428 13.9751 17.7031 14.1314C18.3551 14.504 18.3551 14.9247 18.3551 15.8472V15.9518C18.3551 16.3434 18.3168 16.6872 18.2566 16.9859C19.3478 15.6185 20 13.8854 20 12C20 8.70089 18.003 5.8682 15.1519 4.64482C14.5987 5.01813 13.8398 5.54726 13.575 5.91C13.4396 6.09538 13.2482 7.04166 12.6257 7.11976C12.4626 7.14023 12.2438 7.12589 12.012 7.11097C11.3905 7.07058 10.5402 7.01606 10.268 7.75495C10.0952 8.2232 10.0648 9.49445 10.6239 10.1543C10.7134 10.2597 10.7307 10.4547 10.6699 10.6735C10.59 10.9608 10.4286 11.1356 10.3783 11.1717C10.2819 11.1163 10.0896 10.8931 9.95938 10.7412C9.64554 10.3765 9.25405 9.92233 8.74797 9.78176C8.56395 9.73083 8.36166 9.68867 8.16548 9.64736C7.6164 9.53227 6.99443 9.40134 6.84992 9.09302C6.74442 8.8672 6.74488 8.55621 6.74529 8.22764C6.74529 7.8112 6.74529 7.34029 6.54129 6.88256C6.46246 6.70541 6.35689 6.56446 6.23509 6.45329ZM12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z"></path></svg>

                        </>
                      )}
                    </span>


                  </div>
                </div>
                <div className="image_video_word">
                  <p style={{ whiteSpace: "pre-line" }}>
                    {post.writing ? post.writing : null}
                  </p>

                  {/* Check if there are media items to display */}
                  {((post.img_post && post.img_post.length > 0) ||
                    (post.video_post && post.video_post.length > 0)) && (
                      <div className="post5-media-slider">
                        {(() => {
                          const allMedia = [];

                          // Add videos first to prioritize them
                          if (post.video_post && post.video_post.length > 0) {
                            post.video_post.forEach((video, index) => {
                              allMedia.push({
                                type: "video",
                                src: `backendprojecr-production.up.railway.app/posts/${video}`,
                                key: `video-${index}`,
                              });
                            });
                          }

                          // Then add images
                          if (post.img_post && post.img_post.length > 0) {
                            post.img_post.forEach((img, index) => {
                              allMedia.push({
                                type: "image",
                                src: `backendprojecr-production.up.railway.app/posts/${img}`,
                                key: `img-${index}`,
                              });
                            });
                          }

                          // Function to open gallery modal
                          const openGalleryModal = (mediaIndex) => {
                            setGalleryMedia(allMedia);
                            setCurrentMediaIndex(mediaIndex);
                            setGalleryModalOpen(true);
                          };

                          // Facebook-like gallery layout
                          if (allMedia.length === 1) {
                            // Single media item - full width
                            const media = allMedia[0];
                            return (
                              <div
                                className="fb-gallery fb-gallery-single"
                                onClick={() => openGalleryModal(0)}
                              >
                                {media.type === "image" ? (
                                  <img
                                    src={media.src}
                                    alt=""
                                    className="post-media"
                                  />
                                ) : (
                                  <video
                                    src={media.src}
                                    controls
                                    className="post-media"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                )}
                              </div>
                            );
                          } else if (allMedia.length === 2) {
                            // Two media items - side by side
                            return (
                              <div className="fb-gallery fb-gallery-two">
                                {allMedia.map((media, index) => (
                                  <div
                                    className="fb-gallery-item"
                                    key={media.key}
                                    onClick={() => openGalleryModal(index)}
                                  >
                                    {media.type === "image" ? (
                                      <img
                                        src={media.src}
                                        alt=""
                                        className="post-media"
                                      />
                                    ) : (
                                      <video
                                        src={media.src}
                                        controls
                                        className="post-media"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          } else if (allMedia.length === 3) {
                            // Three media items - one large, two small
                            return (
                              <div className="fb-gallery fb-gallery-three">
                                <div
                                  className="fb-gallery-main"
                                  onClick={() => openGalleryModal(0)}
                                >
                                  {allMedia[0].type === "image" ? (
                                    <img
                                      src={allMedia[0].src}
                                      alt=""
                                      className="post-media"
                                    />
                                  ) : (
                                    <video
                                      src={allMedia[0].src}
                                      controls
                                      className="post-media"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  )}
                                </div>
                                <div className="fb-gallery-side">
                                  {allMedia.slice(1, 3).map((media, index) => (
                                    <div
                                      className="fb-gallery-item"
                                      key={media.key}
                                      onClick={() => openGalleryModal(index + 1)}
                                    >
                                      {media.type === "image" ? (
                                        <img
                                          src={media.src}
                                          alt=""
                                          className="post-media"
                                        />
                                      ) : (
                                        <video
                                          src={media.src}
                                          controls
                                          className="post-media"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          } else if (allMedia.length === 4) {
                            // Four media items - 2x2 grid
                            return (
                              <div className="fb-gallery fb-gallery-four">
                                {allMedia.map((media, index) => (
                                  <div
                                    className="fb-gallery-item"
                                    key={media.key}
                                    onClick={() => openGalleryModal(index)}
                                  >
                                    {media.type === "image" ? (
                                      <img
                                        src={media.src}
                                        alt=""
                                        className="post-media"
                                      />
                                    ) : (
                                      <video
                                        src={media.src}
                                        controls
                                        className="post-media"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          } else if (allMedia.length >= 5) {
                            // Five or more media items - show first 4 with a count overlay on the last one
                            // We've already prioritized videos in the allMedia array, so they'll appear first
                            return (
                              <div className="fb-gallery fb-gallery-many">
                                {allMedia.slice(0, 4).map((media, index) => (
                                  <div
                                    className="fb-gallery-item"
                                    key={media.key}
                                    onClick={() => openGalleryModal(index)}
                                  >
                                    {media.type === "image" ? (
                                      <img
                                        src={media.src}
                                        alt=""
                                        className="post-media"
                                      />
                                    ) : (
                                      <video
                                        src={media.src}
                                        controls
                                        className="post-media"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    )}
                                    {index === 3 && allMedia.length > 4 && (
                                      <div className="fb-gallery-more">
                                        <span>+{allMedia.length - 4}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          } else {
                            return null;
                          }
                        })()}
                      </div>
                    )}
                  <div className="comment_lenght">
                    <p>Likes <span>{post.likes.length}</span></p>
                    <div className="comment_like">
                      <p>
                        Comments <span>{post.comments.length}</span>
                      </p>
                      <p>
                        shares
                      </p>
                    </div>
                  </div>
                </div>
               <div className="interaction">
                  <div className="inter">
                    {Relod_likee && Relod_likeeid === post._id ? (
                      <Relod_like />
                    ) : (

                      <div className="infotest" onClick={() => {
                        Likes(post._id);
                        setRelod_likeeid(post._id);
                      }}>
                        <svg

                          className={`inter-icon 
                      ${post.likes.includes(Mydata) ? "active_hart" : ""}`}
                          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3C19.5376 3 22 5.5 22 9C22 16 14.5 20 12 21.5C9.5 20 2 16 2 9C2 5.5 4.5 3 7.5 3C9.35997 3 11 4 12 5C13 4 14.64 3 16.5 3ZM12.9339 18.6038C13.8155 18.0485 14.61 17.4955 15.3549 16.9029C18.3337 14.533 20 11.9435 20 9C20 6.64076 18.463 5 16.5 5C15.4241 5 14.2593 5.56911 13.4142 6.41421L12 7.82843L10.5858 6.41421C9.74068 5.56911 8.5759 5 7.5 5C5.55906 5 4 6.6565 4 9C4 11.9435 5.66627 14.533 8.64514 16.9029C9.39 17.4955 10.1845 18.0485 11.0661 18.6038C11.3646 18.7919 11.6611 18.9729 12 19.1752C12.3389 18.9729 12.6354 18.7919 12.9339 18.6038Z"></path></svg>
                        <span>Like</span>
                      </div>
                    )}
                    <div className="infotest" onClick={() => {
                      handleCommentClick(post._id);
                      addNewQuestion_com();
                    }}>
                      <svg
                        className="inter-icon"

                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 3H14C18.4183 3 22 6.58172 22 11C22 15.4183 18.4183 19 14 19V22.5C9 20.5 2 17.5 2 11C2 6.58172 5.58172 3 10 3ZM12 17H14C17.3137 17 20 14.3137 20 11C20 7.68629 17.3137 5 14 5H10C6.68629 5 4 7.68629 4 11C4 14.61 6.46208 16.9656 12 19.4798V17Z"></path></svg>
                      <span>Comment</span>
                    </div>
                    <div className="infotest">
                      <svg className="inter-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 14H11C7.54202 14 4.53953 15.9502 3.03239 18.8107C3.01093 18.5433 3 18.2729 3 18C3 12.4772 7.47715 8 13 8V2.5L23.5 11L13 19.5V14ZM11 12H15V15.3078L20.3214 11L15 6.69224V10H13C10.5795 10 8.41011 11.0749 6.94312 12.7735C8.20873 12.2714 9.58041 12 11 12Z"></path></svg>
                      <span>Share</span>
                    </div>

                    {relod_Bookmark && bookMark === post._id ? (
                      <Loading_Bookmark />
                    ) : (
                      <div className="infotest" onClick={() => {
                        bookMarks(post._id);
                        handleBook(post._id);
                      }}>
                        <svg
                          className={`inter-icon  
        ${bookId && bookId.some((item) => item.post?._id === post._id)
                              ? "active_book"
                              : ""
                            }`}
                          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 2H19C19.5523 2 20 2.44772 20 3V22.1433C20 22.4194 19.7761 22.6434 19.5 22.6434C19.4061 22.6434 19.314 22.6168 19.2344 22.5669L12 18.0313L4.76559 22.5669C4.53163 22.7136 4.22306 22.6429 4.07637 22.4089C4.02647 22.3293 4 22.2373 4 22.1433V3C4 2.44772 4.44772 2 5 2ZM18 4H6V19.4324L12 15.6707L18 19.4324V4Z"></path></svg>
                        <span>Save</span>
                      </div>
                    )}
                  </div>
                </div>
                {showCommentForPostId === post._id && (
                  <div className="blore">
                    <div className="comments" ref={commentRef}>
                      <div className="publisher">
                        <FontAwesomeIcon
                          className="out_icon"
                          onClick={handleCloseComment}
                          icon={faTimes}
                        />
                        <p>
                          publication <span>{post.user.name}</span>
                        </p>
                      </div>
                      <div className="comment">
                        {post.comments.map((com, index) => (
                          <div key={index} className="com">
                            <img
                              src={
                                com.user_comment?.profilImage
                                  ? com.user_comment.profilImage.startsWith(
                                    "http"
                                  )
                                    ? com.user_comment.profilImage
                                    : `backendprojecr-production.up.railway.app/user/${com.user_comment.profilImage}`
                                  : "/image/pngegg.png"
                              }
                              alt={`Image of ${com.user_comment?.name || "user"
                                }`}
                            />

                            <div className="name_user_comment">
                              <span>{com.user_comment.name}</span>
                              <p style={{ whiteSpace: "pre-line" }}>
                                {com.comment}
                              </p>
                            </div>
                          </div>
                        ))}
                        {relod_coment ? <Loading_coment /> : null}
                      </div>
                      <form action="" onSubmit={(e) => Commentary(post._id, e)}>
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          ref={inputRef}
                        />
                        <button type="submit" onClick={addNewQuestion}>
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          } else if (post.type === "post_6") {
            return (
              <div key={index} className="all_bost ifrems posts6">
                <div className="name_shoole">
                  <img
                    src={
                      post.user
                        ? `backendprojecr-production.up.railway.app/user/${post.user.profilImage}`
                        : "/image/pngegg.png"
                    }
                    alt=""
                  />
                  <div className="date_shoole">
                    <p>{post.user ? post.user.name : null}{post?.user?.role === "employee" && (<svg className="documentation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.007 2.10377C8.60544 1.65006 7.08181 2.28116 6.41156 3.59306L5.60578 5.17023C5.51004 5.35763 5.35763 5.51004 5.17023 5.60578L3.59306 6.41156C2.28116 7.08181 1.65006 8.60544 2.10377 10.007L2.64923 11.692C2.71404 11.8922 2.71404 12.1078 2.64923 12.308L2.10377 13.993C1.65006 15.3946 2.28116 16.9182 3.59306 17.5885L5.17023 18.3942C5.35763 18.49 5.51004 18.6424 5.60578 18.8298L6.41156 20.407C7.08181 21.7189 8.60544 22.35 10.007 21.8963L11.692 21.3508C11.8922 21.286 12.1078 21.286 12.308 21.3508L13.993 21.8963C15.3946 22.35 16.9182 21.7189 17.5885 20.407L18.3942 18.8298C18.49 18.6424 18.6424 18.49 18.8298 18.3942L20.407 17.5885C21.7189 16.9182 22.35 15.3946 21.8963 13.993L21.3508 12.308C21.286 12.1078 21.286 11.8922 21.3508 11.692L21.8963 10.007C22.35 8.60544 21.7189 7.08181 20.407 6.41156L18.8298 5.60578C18.6424 5.51004 18.49 5.35763 18.3942 5.17023L17.5885 3.59306C16.9182 2.28116 15.3946 1.65006 13.993 2.10377L12.308 2.64923C12.1078 2.71403 11.8922 2.71404 11.692 2.64923L10.007 2.10377ZM6.75977 11.7573L8.17399 10.343L11.0024 13.1715L16.6593 7.51465L18.0735 8.92886L11.0024 15.9999L6.75977 11.7573Z"></path></svg>)} {post?.user?.role === "employee" && (<span className="type_user">Outstanding Student</span>)}</p>
                    <span>
                      {format(new Date(post.createdAt), "MMM dd, yyyy, hh:mm a")}
                      {post?.user?.role === "employee" && (
                        <>
                          <span>•</span>
                          <svg className="world" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.23509 6.45329C4.85101 7.89148 4 9.84636 4 12C4 16.4183 7.58172 20 12 20C13.0808 20 14.1116 19.7857 15.0521 19.3972C15.1671 18.6467 14.9148 17.9266 14.8116 17.6746C14.582 17.115 13.8241 16.1582 12.5589 14.8308C12.2212 14.4758 12.2429 14.2035 12.3636 13.3943L12.3775 13.3029C12.4595 12.7486 12.5971 12.4209 14.4622 12.1248C15.4097 11.9746 15.6589 12.3533 16.0043 12.8777C16.0425 12.9358 16.0807 12.9928 16.1198 13.0499C16.4479 13.5297 16.691 13.6394 17.0582 13.8064C17.2227 13.881 17.428 13.9751 17.7031 14.1314C18.3551 14.504 18.3551 14.9247 18.3551 15.8472V15.9518C18.3551 16.3434 18.3168 16.6872 18.2566 16.9859C19.3478 15.6185 20 13.8854 20 12C20 8.70089 18.003 5.8682 15.1519 4.64482C14.5987 5.01813 13.8398 5.54726 13.575 5.91C13.4396 6.09538 13.2482 7.04166 12.6257 7.11976C12.4626 7.14023 12.2438 7.12589 12.012 7.11097C11.3905 7.07058 10.5402 7.01606 10.268 7.75495C10.0952 8.2232 10.0648 9.49445 10.6239 10.1543C10.7134 10.2597 10.7307 10.4547 10.6699 10.6735C10.59 10.9608 10.4286 11.1356 10.3783 11.1717C10.2819 11.1163 10.0896 10.8931 9.95938 10.7412C9.64554 10.3765 9.25405 9.92233 8.74797 9.78176C8.56395 9.73083 8.36166 9.68867 8.16548 9.64736C7.6164 9.53227 6.99443 9.40134 6.84992 9.09302C6.74442 8.8672 6.74488 8.55621 6.74529 8.22764C6.74529 7.8112 6.74529 7.34029 6.54129 6.88256C6.46246 6.70541 6.35689 6.56446 6.23509 6.45329ZM12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z"></path></svg>

                        </>
                      )}
                    </span>


                  </div>
                </div>
                <div className="ifrem">
                  {/* <h2>What's in the picture?</h2> */}
                  <p style={{ whiteSpace: "pre-line" }}>{post.ifrem.des}</p>
                  <div
                    style={{
                      aspectRatio:
                        post.ifrem?.dimensions === "square"
                          ? "1 / 1"
                          : post.ifrem?.dimensions === "broad"
                            ? "9 / 16"
                            : post.ifrem?.dimensions === "linear"
                              ? "16 / 9"
                              : "16 / 9", // افتراضي
                      width: "100%",
                      maxWidth:
                        post.ifrem?.dimensions === "square"
                          ? "600px"
                          : post.ifrem?.dimensions === "broad"
                            ? "400px"
                            : post.ifrem?.dimensions === "linear"
                              ? "900px"
                              : "800px", // افتراضي
                      margin: "0 auto", // لتوسيط العنصر
                    }}
                  >
                    <iframe
                      src={post.ifrem.url}
                      frameBorder="0"
                      allowFullScreen
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                    />
                  </div>


                  <div className="comment_lenght">
                    <p>Likes <span>{post.likes.length}</span></p>
                    <div className="comment_like">
                      <p>
                        Comments <span>{post.comments.length}</span>
                      </p>
                      <p>
                        shares
                      </p>
                    </div>
                  </div>
                </div>
                    <div className="interaction">
                  <div className="inter">
                    {Relod_likee && Relod_likeeid === post._id ? (
                      <Relod_like />
                    ) : (

                      <div className="infotest" onClick={() => {
                        Likes(post._id);
                        setRelod_likeeid(post._id);
                      }}>
                        <svg

                          className={`inter-icon 
                      ${post.likes.includes(Mydata) ? "active_hart" : ""}`}
                          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3C19.5376 3 22 5.5 22 9C22 16 14.5 20 12 21.5C9.5 20 2 16 2 9C2 5.5 4.5 3 7.5 3C9.35997 3 11 4 12 5C13 4 14.64 3 16.5 3ZM12.9339 18.6038C13.8155 18.0485 14.61 17.4955 15.3549 16.9029C18.3337 14.533 20 11.9435 20 9C20 6.64076 18.463 5 16.5 5C15.4241 5 14.2593 5.56911 13.4142 6.41421L12 7.82843L10.5858 6.41421C9.74068 5.56911 8.5759 5 7.5 5C5.55906 5 4 6.6565 4 9C4 11.9435 5.66627 14.533 8.64514 16.9029C9.39 17.4955 10.1845 18.0485 11.0661 18.6038C11.3646 18.7919 11.6611 18.9729 12 19.1752C12.3389 18.9729 12.6354 18.7919 12.9339 18.6038Z"></path></svg>
                        <span>Like</span>
                      </div>
                    )}
                    <div className="infotest" onClick={() => {
                      handleCommentClick(post._id);
                      addNewQuestion_com();
                    }}>
                      <svg
                        className="inter-icon"

                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 3H14C18.4183 3 22 6.58172 22 11C22 15.4183 18.4183 19 14 19V22.5C9 20.5 2 17.5 2 11C2 6.58172 5.58172 3 10 3ZM12 17H14C17.3137 17 20 14.3137 20 11C20 7.68629 17.3137 5 14 5H10C6.68629 5 4 7.68629 4 11C4 14.61 6.46208 16.9656 12 19.4798V17Z"></path></svg>
                      <span>Comment</span>
                    </div>
                    <div className="infotest">
                      <svg className="inter-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 14H11C7.54202 14 4.53953 15.9502 3.03239 18.8107C3.01093 18.5433 3 18.2729 3 18C3 12.4772 7.47715 8 13 8V2.5L23.5 11L13 19.5V14ZM11 12H15V15.3078L20.3214 11L15 6.69224V10H13C10.5795 10 8.41011 11.0749 6.94312 12.7735C8.20873 12.2714 9.58041 12 11 12Z"></path></svg>
                      <span>Share</span>
                    </div>

                    {relod_Bookmark && bookMark === post._id ? (
                      <Loading_Bookmark />
                    ) : (
                      <div className="infotest" onClick={() => {
                        bookMarks(post._id);
                        handleBook(post._id);
                      }}>
                        <svg
                          className={`inter-icon  
        ${bookId && bookId.some((item) => item.post?._id === post._id)
                              ? "active_book"
                              : ""
                            }`}
                          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 2H19C19.5523 2 20 2.44772 20 3V22.1433C20 22.4194 19.7761 22.6434 19.5 22.6434C19.4061 22.6434 19.314 22.6168 19.2344 22.5669L12 18.0313L4.76559 22.5669C4.53163 22.7136 4.22306 22.6429 4.07637 22.4089C4.02647 22.3293 4 22.2373 4 22.1433V3C4 2.44772 4.44772 2 5 2ZM18 4H6V19.4324L12 15.6707L18 19.4324V4Z"></path></svg>
                        <span>Save</span>
                      </div>
                    )}
                  </div>
                </div>
                {showCommentForPostId === post._id && (
                  <div className="blore">
                    <div className="comments" ref={commentRef}>
                      <div className="publisher">
                        <FontAwesomeIcon
                          className="out_icon"
                          onClick={handleCloseComment}
                          icon={faTimes}
                        />
                        <p>
                          publication <span>{post.user.name}</span>
                        </p>
                      </div>
                      <div className="comment">
                        {post.comments.map((com, index) => (
                          <div key={index} className="com">
                            <img
                              src={
                                com.user_comment?.profilImage
                                  ? com.user_comment.profilImage.startsWith(
                                    "http"
                                  )
                                    ? com.user_comment.profilImage
                                    : `backendprojecr-production.up.railway.app/user/${com.user_comment.profilImage}`
                                  : "/image/pngegg.png"
                              }
                              alt={`Image of ${com.user_comment?.name || "user"
                                }`}
                            />

                            <div className="name_user_comment">
                              <span>{com.user_comment.name}</span>
                              <p style={{ whiteSpace: "pre-line" }}>
                                {com.comment}
                              </p>
                            </div>
                          </div>
                        ))}
                        {relod_coment ? <Loading_coment /> : null}
                      </div>
                      <form action="" onSubmit={(e) => Commentary(post._id, e)}>
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          ref={inputRef}
                        />
                        <button type="submit" onClick={addNewQuestion}>
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          } else {
            return null;
          }
        })
    }
    </div>
  );
};

export default Bosts;
