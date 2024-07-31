import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark, faUserCircle ,faEnvelope} from "@fortawesome/free-solid-svg-icons";
import "../Styles/Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from '../../auth';
import {jwtDecode} from 'jwt-decode';
import axios from "axios";
import { io } from "socket.io-client";

const socket = io('http://localhost:5000');
function Navbar() {
  const [nav, setNav] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notificationDropdown, setNotificationDropdown] = useState(false);

  const auth = useAuth();
  const [token, setToken] = useState(auth);
  const [userId, setUserId] = useState();
  const { logout } = useAuth();
  const [ user , setUser] = useState({})

  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  const openNav = () => {
    setNav(!nav);
  };

console.log(user)

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/notifications?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  
  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token);
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.sub.id);
      setUser(decoded.sub)

    } else {
      setUserId("");
      setUser("")

    }

    setInterval(() => {
        if (userId) {
          
      
          fetchNotifications();
      
          
        }
    
      },  2000);
    
  }, []);

   

 

  
  


  console.log(notifications)
  
  
  const handelLogOut = () => {
    logout();
    setToken(null);
    navigate("/");
  };
  

  return (
    <div className="navbar-section">
      <h1 className="navbar-title">
        <Link to="/">
        <span> Health</span>
           <span className="navbar-sign">+</span>
        </Link>
      </h1>

      <ul className="navbar-items">
        <li>
          <Link to="/" className="navbar-links">
            الصفحة الرئيسية
          </Link>
        </li>
        <li>
          <a href="#services" className="navbar-links">
            الخدمات
          </a>
        </li>
        <li>
          <a href="#about" className="navbar-links">
            حول المنصة
          </a>
        </li>
        <li>
          <a href="#doctors" className="navbar-links">
            الاطباء
          </a>
        </li>
      </ul>

      <div className="navbar-auth-section">
        {!token ? (
          <div>
            <Link to="login">
              <button className="navbar-btn" type="button">
                Login
              </button>
            </Link>
            <Link to="register">
              <button className="navbar-btn" type="button">
                Register
              </button>
            </Link>
          </div>
        ) : (
          <div style={{display:"flex"}}>
            <div className="navbar-profile">
            <FontAwesomeIcon
              icon={faUserCircle}
              className="profile-icon"
              onClick={() => setProfileDropdown(!profileDropdown)}
            />
            {profileDropdown && (
              <div className="profile-dropdown">
                <Link to={`/profile/${userId}`} onClick={() => setProfileDropdown(false)}>
                  Profile
                </Link>
                <button onClick={handelLogOut}>
                  Logout
                </button>
              </div>

            )}
          </div>

          <div className="navbar-profile">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="notifiction-icon "
              onClick={() => setNotificationDropdown(!notificationDropdown)}
              style={{marginRight :"10px",marginLight :"10px"}}
            />
            <span className="notifiction-point"> </span>
            {notificationDropdown && (
              <div className="profile-dropdown">
                {
                  notifications.map((item,i) => {
                    return(<div key={i}>
                      
                      <div className="notification"> 
                        <span className="message">{item.message}</span>  
                        <span className="timestamp">{item.timestamp}</span>  

                      </div>
                       </div>)
                  })
                }
              </div>

            )}
          </div>
           </div>
        )}
      </div>

      {/* Mobile Navbar */}
      <div className={`mobile-navbar ${nav ? "open-nav" : ""}`}>
        <div onClick={openNav} className="mobile-navbar-close">
          <FontAwesomeIcon icon={faXmark} className="hamb-icon" />
        </div>

        <ul className="mobile-navbar-links">
          <li>
            <Link onClick={openNav} to="/">
              الصفحة الرئيسية
            </Link>
          </li>
          <li>
            <a onClick={openNav} href="#services">
              الخدمات
            </a>
          </li>
          <li>
            <a onClick={openNav} href="#about">
              حول المنصة
            </a>
          </li>
          <li>
            <a onClick={openNav} href="#doctors">
              الاطباء
            </a>
          </li>
          {!token ? (
            <>
              <li>
                <Link onClick={openNav} to="login">
                  Login
                </Link>
              </li>
              <li>
                <Link onClick={openNav} to="register">
                  Register
                </Link>
              </li>
            </>
          ) : (
            <li>
              <Link to={`/profile/${userId}`} onClick={openNav}>
                Profile
              </Link>
            </li>
          )}
        </ul>
      </div>

      <div className="mobile-nav">
        
        {token ? (
          <FontAwesomeIcon
            icon={faUserCircle}
            className="profile-icon"
            onClick={() => setProfileDropdown(!profileDropdown)}
          />
        ) : null}

<div className="navbar-profile">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="notifiction-icon"
              onClick={() => setNotificationDropdown(!notificationDropdown)}
              style={{marginRight :"10px",marginLeft :"10px"}}
            />
            <span className="notifiction-point"> </span>

            {notificationDropdown && (
              <div className="profile-dropdown">
                {
                  notifications.map((item,i) => {
                    return(<div key={i}>
                      
                      <div className="notification"> 
                        <span className="message">{item.message}</span>  
                        <span className="timestamp">{item.timestamp}</span>  

                      </div>
                       </div>)
                  })
                }
              </div>

            )}
          </div>


        <FontAwesomeIcon
          icon={faBars}
          onClick={openNav}
          className="hamb-icon"
        />

        {profileDropdown && (
          <div className="profile-dropdown">
            <Link to={`/profile/${userId}`} onClick={() => setProfileDropdown(false)}>
              Profile
            </Link>
            <button onClick={handelLogOut}>
              Logout
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
}

export default Navbar;
