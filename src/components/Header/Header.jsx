import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useCookies } from "react-cookie";
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';

const Header = ({ toggle }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleProfileClick = () => {
    setMenuVisible(!menuVisible);
  };

  const [cookies, setCookies] = useCookies(["token"]);
  const Navigate = useNavigate();

  const logout = () => {
    axios.put('backendprojecr-production.up.railway.app/api/v2/auth/logout', {}, {
      headers: {
        Authorization: `Bearer ${cookies.token}`,
      }
    }).then((res) => {
      setCookies("token", "");
      window.localStorage.removeItem("token");
      Navigate('/signandlog')
    }).catch((err) => {
      console.log(err)
    })
  }
  const [MyData, setMyData] = useState([]);
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





  // داخل مكونك:
  const commentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        commentRef.current &&
        !commentRef.current.contains(event.target)
      ) {
        setMenuVisible(false); // سكّر المينيو
      }
    };

    if (menuVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuVisible]);


  return (
    <header>
      <div className='container'>
        <div className='header_respon'>
          <img src="./image/log1.png" alt="" />
          <form action="">
            {/* <FontAwesomeIcon className='search_icon' icon={faSearch} /> */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2C15.968 2 20 6.032 20 11C20 15.968 15.968 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2ZM11 18C14.8675 18 18 14.8675 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18ZM19.4853 18.0711L22.3137 20.8995L20.8995 22.3137L18.0711 19.4853L19.4853 18.0711Z"></path></svg>
            <input type="text" placeholder='Search.' />
          </form>

          <div className='profile' onClick={toggle} >
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

            {/* <p>{MyData.name}</p> */}

            <div
              className="menu_hover"
              style={{ display: menuVisible ? 'block' : 'none' }}

            >
              <NavLink to="/profile" className="my_profile">
                <p>My Profile</p>
              </NavLink>
              <div className="logout" onClick={logout}>
                <FontAwesomeIcon className='logout_icon' icon={faSignOutAlt} />
                <p>LogOut</p>
              </div>
            </div>
          </div>




        </div>
      </div>
    </header>
  );
};

export default Header;
