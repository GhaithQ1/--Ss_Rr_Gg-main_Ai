import { useEffect, useState } from "react";
import "./Home.css";
import Menu from "../main_menu/Menu";
import Bosts from "../bosts/Bosts";
import Chat from "../chat/Chat";
import ImageSlider from "../ImageSlider/ImageSlider";
import Create_menu from "../Create_menu/Create_menu";
import { CookiesProvider, useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Info_menu from "../Info_menu/Info_menu";
import Shools from "../Shools/Shools";
import axios from "axios";
import Publish_post from "../Publish_post/Publish_post";
import Filter_post from "../Filter_post/Filter_post";
import Load_home from "../Load_home/Load_home";
const Home = ({showComponent}) => {
  const [Mydata, SetMydata] = useState({});

  const [cookies, setCookies] = useCookies("token");
  useEffect(() => {

    const fetchMyData = async () => {
      try {
        const res = await axios.get(
          "backendprojecr-production.up.railway.app/api/v2/auth/get_date_my",
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


  return (
    <>
    <div className="home">
        <div className="container">
          <div className="flexinfo">
            <div className={`mobile-toggle ${showComponent ? 'show' : ''}`}>
           <Info_menu/>
           </div>
            <Shools/>
          </div>
          <div className="rew">
            <Publish_post/>
            {Mydata.role === "employee" || Mydata.role === "admin" ? (
              <Create_menu />
            ) : null}
            <Filter_post/>
            <Bosts />
          </div>

          <Chat />
        </div>
      </div>
    </>
  );
};

export default Home;
