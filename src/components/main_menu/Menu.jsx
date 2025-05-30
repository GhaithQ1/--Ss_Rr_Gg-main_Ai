import React, { useState, useEffect } from 'react';
import './Menu.css';
import { NavLink } from 'react-router-dom';
import { useUser } from '../Context';

const Menu = () => {

  const { setUserTheme } = useUser();




  const [isToggled, setIsToggled] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme === 'dark';
  });

useEffect(() => {
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  if (isToggled) {
    document.body.classList.add('root_da');
    localStorage.setItem('theme', 'dark');
    if (themeColorMeta) themeColorMeta.setAttribute('content', '#1f1a32'); // لون الدارك
  } else {
    document.body.classList.remove('root_da');
    localStorage.setItem('theme', 'light');
    if (themeColorMeta) themeColorMeta.setAttribute('content', '#f0edf5'); // لون اللايت
  }
}, [isToggled]);


  const handleToggle = () => {
    setIsToggled((prev) => !prev);
    setUserTheme((prev) => !prev);
  };

  return (
    <div className='menu'>
      <div className='sidebar__list'>
        <NavLink to="/" className={({ isActive }) => `navbar${isActive ? ' active' : ''}`}>
          {/* <FontAwesomeIcon className='nav_icon' icon={faHome} /> */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21H5C4.44772 21 4 20.5523 4 20V11L1 11L11.3273 1.6115C11.7087 1.26475 12.2913 1.26475 12.6727 1.6115L23 11L20 11V20C20 20.5523 19.5523 21 19 21ZM6 19H18V9.15745L12 3.7029L6 9.15745V19Z"></path></svg>          <p>Home</p>
        </NavLink>

        <NavLink to="/explore" className={({ isActive }) => `navbar${isActive ? ' active' : ''}`}>
          {/* <FontAwesomeIcon className='nav_icon' icon={faCompass} /> */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM16.5 7.5L14 14L7.5 16.5L10 10L16.5 7.5ZM12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"></path></svg>
          <p>Explore</p>
        </NavLink>


        <NavLink to="/cours" className={({ isActive }) => `navbar${isActive ? ' active' : ''}`}>
          {/* <FontAwesomeIcon className='nav_icon' icon={faBell} /> */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 11.3333L0 9L12 2L24 9V17.5H22V10.1667L20 11.3333V18.0113L19.7774 18.2864C17.9457 20.5499 15.1418 22 12 22C8.85817 22 6.05429 20.5499 4.22263 18.2864L4 18.0113V11.3333ZM6 12.5V17.2917C7.46721 18.954 9.61112 20 12 20C14.3889 20 16.5328 18.954 18 17.2917V12.5L12 16L6 12.5ZM3.96927 9L12 13.6846L20.0307 9L12 4.31541L3.96927 9Z"></path></svg>
          <p>Course</p>
        </NavLink>

        <NavLink
          to={`/chat`}
          className={({ isActive }) => `navbar icon_chats${isActive ? ' active' : ''}`}
        >
          {/* <FontAwesomeIcon className='nav_icon' icon={faComments} /> */}
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.29117 20.8242L2 22L3.17581 16.7088C2.42544 15.3056 2 13.7025 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.2975 22 8.6944 21.5746 7.29117 20.8242ZM7.58075 18.711L8.23428 19.0605C9.38248 19.6745 10.6655 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 13.3345 4.32549 14.6175 4.93949 15.7657L5.28896 16.4192L4.63416 19.3658L7.58075 18.711Z"></path></svg>          <p>Chat</p>
        </NavLink>
                <NavLink to="/chat_bot" className={({ isActive }) => `navbar${isActive ? ' active' : ''}`}>
                    {/* <FontAwesomeIcon className='nav_icon' icon={faRobot} /> */}
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.7134 8.12811L20.4668 8.69379C20.2864 9.10792 19.7136 9.10792 19.5331 8.69379L19.2866 8.12811C18.8471 7.11947 18.0555 6.31641 17.0677 5.87708L16.308 5.53922C15.8973 5.35653 15.8973 4.75881 16.308 4.57612L17.0252 4.25714C18.0384 3.80651 18.8442 2.97373 19.2761 1.93083L19.5293 1.31953C19.7058 0.893489 20.2942 0.893489 20.4706 1.31953L20.7238 1.93083C21.1558 2.97373 21.9616 3.80651 22.9748 4.25714L23.6919 4.57612C24.1027 4.75881 24.1027 5.35653 23.6919 5.53922L22.9323 5.87708C21.9445 6.31641 21.1529 7.11947 20.7134 8.12811ZM10 3H14V5H10C6.68629 5 4 7.68629 4 11C4 14.61 6.46208 16.9656 12 19.4798V17H14C17.3137 17 20 14.3137 20 11H22C22 15.4183 18.4183 19 14 19V22.5C9 20.5 2 17.5 2 11C2 6.58172 5.58172 3 10 3Z"></path></svg>               
     <p>Chat Ai</p>
                </NavLink>
      </div>
    </div>
  );
};

export default Menu;


