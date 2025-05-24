import React, { useState, useEffect } from 'react';
import './Info_menu.css'
import { NavLink } from 'react-router-dom';
import { useUser } from '../Context';
import axios from 'axios';
import { useCookies } from "react-cookie";
import { useNavigate } from 'react-router-dom';

const Info_menu = () => {
    const { setUserTheme } = useUser();
    const [cookies, setCookies] = useCookies(["token"]);
    const Navigate = useNavigate();

    const [isToggled, setIsToggled] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        return storedTheme === 'dark';
    });

    useEffect(() => {
        if (isToggled) {
            document.body.classList.add('root_da');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('root_da');
            localStorage.setItem('theme', 'light');
        }
    }, [isToggled]);

    const handleToggle = () => {
        setIsToggled((prev) => !prev);
        setUserTheme((prev) => !prev);
    };

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
            console.log({ "error": err })
        })
    }


    const [MyData, setMyData] = useState();
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



    const [showMore, setShowMore] = useState(false);

    const handleMoreClick = () => {
        setShowMore(!showMore);
    };
    return (
        <div className="info_menu">
            <div className="info_user">
                <img
                    src={
                        MyData?.profilImage
                            ? MyData?.profilImage.startsWith("http")
                                ? MyData?.profilImage
                                : `backendprojecr-production.up.railway.app/user/${MyData?.profilImage}`
                            : "/image/pngegg.png"
                    }
                    alt={`Image of ${MyData?.name}`}
                />
                <div className="info_data">
                    <p>{MyData?.name}</p>
                    <span>{MyData?.email}</span>
                </div>
            </div>
            <div className="info_link">
                <NavLink to="/profile" className={({ isActive }) => `navbar_link${isActive ? ' active' : ''}`}>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"></path></svg>                    <p>Profile</p>
                </NavLink>
                <NavLink to="/notifications" className={({ isActive }) => `navbar_link${isActive ? ' active' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 18H19V11.0314C19 7.14806 15.866 4 12 4C8.13401 4 5 7.14806 5 11.0314V18ZM12 2C16.9706 2 21 6.04348 21 11.0314V20H3V11.0314C3 6.04348 7.02944 2 12 2ZM9.5 21H14.5C14.5 22.3807 13.3807 23.5 12 23.5C10.6193 23.5 9.5 22.3807 9.5 21Z"></path></svg>
                    <p>Notifications</p>
                </NavLink>
                <NavLink to="/bookmark" className={({ isActive }) => `navbar_link${isActive ? ' active' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 2H19C19.5523 2 20 2.44772 20 3V22.1433C20 22.4194 19.7761 22.6434 19.5 22.6434C19.4061 22.6434 19.314 22.6168 19.2344 22.5669L12 18.0313L4.76559 22.5669C4.53163 22.7136 4.22306 22.6429 4.07637 22.4089C4.02647 22.3293 4 22.2373 4 22.1433V3C4 2.44772 4.44772 2 5 2ZM18 4H6V19.4324L12 15.6707L18 19.4324V4Z"></path></svg>
                    <p>Bookmarks</p>
                </NavLink>

                <div className={`extra-options ${showMore ? 'show' : ''}`}>
                    <div className="navbar_link" onClick={handleToggle}>
                        {isToggled ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7ZM4 12C4 16.4183 7.58172 20 12 20C15.0583 20 17.7158 18.2839 19.062 15.7621C18.3945 15.9187 17.7035 16 17 16C12.0294 16 8 11.9706 8 7C8 6.29648 8.08133 5.60547 8.2379 4.938C5.71611 6.28423 4 8.9417 4 12Z"></path>
                            </svg>
                        )}
                        <p>{isToggled ? 'Light Mode' : 'Dark Mode'}</p>
                    </div>

                    <div className="navbar_link logout" onClick={logout}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C15.2713 2 18.1757 3.57078 20.0002 5.99923L17.2909 5.99931C15.8807 4.75499 14.0285 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C14.029 20 15.8816 19.2446 17.2919 17.9998L20.0009 17.9998C18.1765 20.4288 15.2717 22 12 22ZM19 16V13H11V11H19V8L24 12L19 16Z"></path>
                        </svg>
                        <p>Log Out</p>
                    </div>
                </div>



                <div className={`navbar_link more ${showMore ? 'active' : ''}`} onClick={handleMoreClick}>
                    <p>More</p>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{
                            transform: showMore ? 'rotate(-90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                        }}
                    >
                        <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" />
                    </svg>
                </div>
                {/* نحتفظ بالعناصر دائماً، ونضيف كلاس "show" حسب الحالة */}

            </div>

        </div>
    )
}

export default Info_menu