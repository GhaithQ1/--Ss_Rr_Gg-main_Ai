import { useEffect, useState } from "react";
import "./Home.css";
import Menu from "../main_menu/Menu";
import Bosts from "../bosts/Bosts";
import Chat from "../chat/Chat";
import ImageSlider from "../ImageSlider/ImageSlider";
import Create_menu from "../Create_menu/Create_menu";
import { CookiesProvider, useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const Home = () => {
  const [Mydata, SetMydata] = useState({});
  const Navigate = useNavigate();

  const token = window.localStorage.getItem("token");
  const [cookies, setCookies] = useCookies("token");

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v2/auth/get_date_my",
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
    if (token) {
      setCookies("token", token);
    } else {
      Navigate("/signandlog");
    }
  }, []);
  return (
    <>
      <div className="home">
        <div className="container">
          <Menu />
          <div className="rew">
            <ImageSlider />
            {Mydata.role === "employee" || Mydata.role === "admin" ? (
              <Create_menu />
            ) : null}
            <Bosts />
          </div>

          <Chat />
        </div>
      </div>
    </>
  );
};

export default Home;
