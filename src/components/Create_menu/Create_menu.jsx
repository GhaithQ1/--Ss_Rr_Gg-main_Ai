import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Create_menu.css';
import { NavLink } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const Create_menu = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [Mydata, SetMydata] = useState({});
  const [cookies] = useCookies(['token']);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const res = await axios.get(
          'backendprojecr-production.up.railway.app/api/v2/auth/get_date_my',
          {
            headers: { Authorization: `Bearer ${cookies.token}` },
          }
        );
        SetMydata(res.data.data);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    fetchMyData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };










  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });

  const handleMouseEnter = (e, text) => {
    setTooltip({ visible: true, text, x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  const handleMouseMove = (e) => {
    if (tooltip.visible) {
      setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
    }
  };

  const links = [
    {
      to: "/Create_Bost_Video_and_image",
      text: "Text, image or video.",
      tooltip: "Share images, videos, and text together. Ideal for explaining ideas or sharing visual and educational content."
    },
    {
      to: "/create_bost_choose_the_correct_answer",
      text: "Choose The Correct Answer",
      tooltip: "Interactive quiz with multiple-choice questions. Suitable for educational tests and engagement."
    },
    {
      to: "/create_bost_image_and_answer",
      text: "Based on the image, select the correct answer.",
      tooltip: "Display an image with multiple answer choices to select the correct one. Ideal for testing visual comprehension."
    },
    {
      to: "/create_bost_image_and_ward",
      text: "Image And Word",
      tooltip: "Display an image with a word pronunciation upon clicking. Useful for teaching vocabulary."
    },
    {
      to: "/create_bost_true_or_false",
      text: "True or false.",
      tooltip: "Present a statement and determine if it's true or false. Perfect for testing concepts and information."
    },
    {
      to: "/Create_Bost_Ifrem",
      text: "<iframe>/<script>",
      tooltip: "Embed external content such as YouTube videos or interactive tools using an iframe."
    }
  ];
  
  

  return (
    <div className="create_menu">
      <div className="img_create" >
<img
  src={
    Mydata.profilImage
      ? Mydata.profilImage.startsWith("http")
        ? Mydata.profilImage
        : `backendprojecr-production.up.railway.app/user/${Mydata.profilImage}`
      : "/image/pngegg.png"
  }
  alt={`Image of ${Mydata.name}`}
/>
        <p>Please choose from the list the {Mydata.name}</p>
      </div>

            <button
              type="submit"
              onClick={toggleMenu}
              className="button"
            >
              <div className="bg"></div>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 342 208"
                height="208"
                width="342"
                className="splash"
              >
                <path
                  strokeLinecap="round"
                  strokeWidth="3"
                  d="M54.1054 99.7837C54.1054 99.7837 40.0984 90.7874 26.6893 97.6362C13.2802 104.485 1.5 97.6362 1.5 97.6362"
                />
                <path
                  strokeLinecap="round"
                  strokeWidth="3"
                  d="M285.273 99.7841C285.273 99.7841 299.28 90.7879 312.689 97.6367C326.098 104.486 340.105 95.4893 340.105 95.4893"
                />
                {/* باقي عناصر الـ SVG نفسها بس مغلقة بشكل صحيح وتعديل style/props حسب JSX */}
                {/* لتوفير المساحة يمكنني أكمّل باقي الـ <path> إن حبيت */}
              </svg>

              <div className="wrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 221 42"
                  height="42"
                  width="221"
                  className="path"
                >
                  <path
                    strokeLinecap="round"
                    strokeWidth="3"
                    d="M182.674 2H203C211.837 2 219 9.16344 219 18V24C219 32.8366 211.837 40 203 40H18C9.16345 40 2 32.8366 2 24V18C2 9.16344 9.16344 2 18 2H47.8855"
                  />
                </svg>

                <div className="outline"></div>

                <div className="content">
                  <span className="char state-1">
                    {
                      ["C", "r",  "e",  "t", "e", "a", "p",  "o", "s", "t"].map((char, i) => (
                        <span
                          key={i}
                          data-label={char}
                          style={{ "--i": i + 1 }}
                        >
                          {char}
                        </span>
                      ))
                    }
                  </span>

   
                </div>
              </div>
            </button>


      <div className="menus" style={{ display: showMenu ? 'block' : 'none' }} ref={menuRef} >
      {links.map((link, index) => (
        <NavLink
          key={index}
          to={link.to}
          className="links"
          onMouseEnter={(e) => handleMouseEnter(e, link.tooltip)}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          <p>{link.text}</p>
        </NavLink>
      ))}

      {tooltip.visible && (
        <div
          className="tooltip"
          style={{
            width:"400px",
            position: 'fixed',
            top: tooltip.y - 70,
            left: tooltip.x + -10,
            backgroundColor: '#1f1a32',
            color: '#fff',
            padding: '5px 10px',
            borderRadius: '8px',
            pointerEvents: 'none',
            fontSize: '12px',
            zIndex: 9999,
          }}
        >
          {tooltip.text}
          {/* {description.text} */}
        </div>
      )}
    </div>
    </div>
  );
};

export default Create_menu;
