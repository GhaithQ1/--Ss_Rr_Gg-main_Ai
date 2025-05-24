import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useCookies } from "react-cookie";
import "./Publish_post.css"

import { useNavigate } from "react-router-dom";

const Publish_post = () => {
  const [MyData, setMyData] = useState([]);
  const [cookies, setCookies] = useCookies(["token"]);

  useEffect(() => {
    axios.get(`backendprojecr-production.up.railway.app/api/v2/auth/get_date_my`, {
      headers: {
        Authorization: `Bearer ${cookies.token}`,
      },
    })
      .then(res => {
        setMyData(res.data.data);

      })
      .catch(error => {
        console.error('Error fetching data', error);
      });
  }, []);







  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const [qus1, Setrqs1] = useState("");
  const [Load_butt, setLoad_butt] = useState(false);

  // ✅ تخزين الملفات بشكل صحيح
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // ✅ معالجة رفع الصور المتعددة
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);
    }
  };

  // ✅ معالجة رفع الفيديوهات المتعددة
  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setVideoFiles((prev) => [...prev, ...files]);
    }
  };

  // ✅ حذف صورة محددة
  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ حذف فيديو محدد
  const removeVideo = (index) => {
    setVideoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ تعديل `handleSubmit` لإرسال عدة صور وفيديوهات
  const handleSubmit = async (e) => {
    setLoad_butt(true);
    e.preventDefault();
    const formData = new FormData();

    if (qus1) {
      formData.append("writing", qus1);
    }

    // ✅ إضافة جميع الصور بشكل صحيح
    imageFiles.forEach((file) => formData.append("img_post", file));

    // ✅ إضافة جميع الفيديوهات بشكل صحيح
    videoFiles.forEach((file) => formData.append("video_post", file));

    // ✅ طباعة `FormData` للتحقق
    for (let pair of formData.entries()) {
      // console.log(pair[0], pair[1]);
    }

    try {
      const response = await axios.post(
        "backendprojecr-production.up.railway.app/api/v2/post/post",
        formData,
        {
          headers: {
            Authorization: `Bearer ${cookies.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("تم الإرسال:", response.data);

      // ✅ تصفية الفورم بعد الإرسال
      setImageFiles([]);
      setVideoFiles([]);
      Setrqs1("");
      imageInputRef.current.value = "";
      videoInputRef.current.value = "";

      window.location = '/'
      setLoad_butt(false);
    } catch (err) {
      if (err.response?.data?.errors) {
        const formattedErrors = {};
        err.response.data.errors.forEach((error) => {
          formattedErrors[error.path] = error;
        });
        setFormErrors(formattedErrors);
      }
      setLoad_butt(false);
    }
  };








    const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);

    // ضبط الارتفاع حسب المحتوى
    textareaRef.current.style.height = "auto"; // رجع الارتفاع الافتراضي
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"; // خليها على حسب المحتوى
  };

  // حتى لو صار عندنا قيمة ابتدائية، نتأكد الارتفاع مضبوط
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, []);
  return (
    <div className='Publish_post'>
      <div className="info_publish">
        <img
          src={
            MyData.profilImage
              ? MyData.profilImage.startsWith("http")
                ? MyData.profilImage
                : `backendprojecr-production.up.railway.app/user/${MyData.profilImage}`
              : "/image/pngegg.png"
          }
          alt={`Image of ${MyData.name}`}
        />
        <textarea type="text" name="" id="" placeholder={`What are you thinking today?`}
          value={qus1}
          ref={textareaRef}
          onChange={(e) => {Setrqs1(e.target.value);handleChange(e)}} />
                            <button
            className='websit_button'   
             type="submit"
              onClick={handleSubmit}>Publish</button>
      </div>

      <div className="icon_publish">
        <div className="icon_text_publish"
          onClick={() => videoInputRef.current.click()}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3.9934C3 3.44476 3.44495 3 3.9934 3H20.0066C20.5552 3 21 3.44495 21 3.9934V20.0066C21 20.5552 20.5551 21 20.0066 21H3.9934C3.44476 21 3 20.5551 3 20.0066V3.9934ZM5 5V19H19V5H5ZM10.6219 8.41459L15.5008 11.6672C15.6846 11.7897 15.7343 12.0381 15.6117 12.2219C15.5824 12.2658 15.5447 12.3035 15.5008 12.3328L10.6219 15.5854C10.4381 15.708 10.1897 15.6583 10.0672 15.4745C10.0234 15.4088 10 15.3316 10 15.2526V8.74741C10 8.52649 10.1791 8.34741 10.4 8.34741C10.479 8.34741 10.5562 8.37078 10.6219 8.41459Z"></path></svg>
          <p>Video</p>
        </div>
        <div className="icon_text_publish"
          onClick={() => imageInputRef.current.click()}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2.9918 21C2.44405 21 2 20.5551 2 20.0066V3.9934C2 3.44476 2.45531 3 2.9918 3H21.0082C21.556 3 22 3.44495 22 3.9934V20.0066C22 20.5552 21.5447 21 21.0082 21H2.9918ZM20 15V5H4V19L14 9L20 15ZM20 17.8284L14 11.8284L6.82843 19H20V17.8284ZM8 11C6.89543 11 6 10.1046 6 9C6 7.89543 6.89543 7 8 7C9.10457 7 10 7.89543 10 9C10 10.1046 9.10457 11 8 11Z"></path></svg>
          <p>Photo</p>
        </div>
        <div className="icon_text_publish">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21 8V20.9932C21 21.5501 20.5552 22 20.0066 22H3.9934C3.44495 22 3 21.556 3 21.0082V2.9918C3 2.45531 3.4487 2 4.00221 2H14.9968L21 8ZM19 9H14V4H5V20H19V9ZM8 7H11V9H8V7ZM8 11H16V13H8V11ZM8 15H16V17H8V15Z"></path></svg>
          <p>File</p>
        </div>
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={handleImageChange}
          style={{ display: "none" }}
          multiple
        />

        {/* إدخال مخفي للفيديو */}
        <input
          type="file"
          accept="video/*"
          ref={videoInputRef}
          onChange={handleVideoChange}
          style={{ display: "none" }}
          multiple
        />
      </div>
            {/* ✅ عرض الصور والفيديوهات بعد الرفع */}
<div className="img_vid_flex">
  {[
    ...imageFiles.map((img) => ({ type: "image", file: img })),
    ...videoFiles.map((video) => ({ type: "video", file: video })),
  ]
    .slice(0, 4)  
    .map(({ type, file }, index) => (
      <div key={index} style={{ position: "relative", width: "calc(50% - 1px)" ,height: '200px'}}>
        {type === "image" ? (
          <img
            src={URL.createObjectURL(file)}
            alt="Selected"
            style={{ width: "100%",    height: '200px' }}
          />
        ) : (
          <video
            src={URL.createObjectURL(file)}
            controls
            style={{ width: "100%",     height: '200px'}}
          />
        )}
        <button
          onClick={() =>
            type === "image"
              ? removeImage(index)
              : removeVideo(index - imageFiles.length)
          }
          className="remove-btn"
        >
          ×
        </button>

        {index === 3 && (imageFiles.length + videoFiles.length) > 4 && (  // هنا شرط الظهور ب 4
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              fontSize: "2rem",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "8px",
              userSelect: "none",
            }}
          >
            +{(imageFiles.length + videoFiles.length) - 4}
          </div>
        )}
      </div>
    ))}
</div>

  
    </div>
  )
}

export default Publish_post