import React from "react";
import Doctor from "../Assets/doctor-book-appointment.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate  } from "react-router-dom";
import "../Styles/BookAppointment.css";
import { useAuth } from "../../auth";

function BookAppointment() {
  const navigate = useNavigate();
  const {auth} = useAuth()

  const handleBookAppointmentClick = () => {
    auth ? navigate("/doctors") : navigate("/login")

  };

  return (
    <div className="ba-section">
      <div className="ba-image-content">
        <img src={Doctor} alt="Doctor Group" className="ba-image1" />
      </div>

      <div className="ba-text-content">
        <h3 className="ba-title">
          <span>‏لماذا تختار هيلث
          </span>
        </h3>
        <p className="ba-description">
        ‏اكتشف أسباب اختيار هيلث بلس لاحتياجات الرعاية الصحية الخاصة بك. جرب رعاية الخبراء والراحة والحلول الشخصية ، مما يجعل رفاهيتك على رأس أولوياتنا. انضم إلينا في رحلة إلى صحة أفضل وحياة أكثر سعادة.‏


        </p>

        <p className="ba-checks ba-check-first">
          <FontAwesomeIcon icon={faCircleCheck} style={{ color: "#1E8FFD" }} /> ‏ أفضل الأطباء المحترفين‏


        </p>
        <p className="ba-checks">
          <FontAwesomeIcon icon={faCircleCheck} style={{ color: "#1E8FFD" }} /> ‏ رعاية في حالة الطوارئ‏


        </p>
        <p className="ba-checks">
          <FontAwesomeIcon icon={faCircleCheck} style={{ color: "#1E8FFD" }} /> ‏ 24/7 دعم  على مدار الساعة  


        </p>
        <p className="ba-checks ba-check-last">
          <FontAwesomeIcon icon={faCircleCheck} style={{ color: "#1E8FFD" }} />‏ التسجيل سهل وسريع‏


        </p>

        <button
          className="text-appointment-btn"
          type="button"
          onClick={handleBookAppointmentClick}
        >
          <FontAwesomeIcon icon={faCalendarCheck} /> حجز موعد الآن        </button>
      </div>
    </div>
  );
}

export default BookAppointment;
