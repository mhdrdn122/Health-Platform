import React, { useEffect, useState } from "react";
import Doctor from "../Assets/profile-2.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import { useNavigate  } from "react-router-dom";
import "../Styles/Hero.css";
import { useAuth } from "../../auth";

function Hero() {
  const navigate = useNavigate();
  const [goUp, setGoUp] = useState(false);
  const {auth} = useAuth()
  const role = localStorage.getItem("role")
console.log(role)
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookAppointmentClick = () => {
    auth ? navigate("/doctors") : navigate("/login")
  };

  useEffect(() => {
    const onPageScroll = () => {
      if (window.scrollY > 600) {
        setGoUp(true);
      } else {
        setGoUp(false);
      }
    };
    window.addEventListener("scroll", onPageScroll);

    return () => {
      window.removeEventListener("scroll", onPageScroll);
    };
  }, []);

  return (
    <div className="section-container">
      <div className="hero-section">
        <div className="text-section">
          <p className="text-headline" style={{direction:"rtl"}}> الصحة تأتي أولاً ❤️</p>
          <h2 className="text-title">
            {/* Find your Doctor and make an Appointments */}
            تواصل مع طبيبك و احجز مواعيد بسهولة و سرعة وأمان
          </h2>
          <p className="text-descritpion">
            {/* Talk to online doctors and get medical advice, online prescriptions,
            refills and medical notes within minutes. On-demand healthcare
            services at your fingertips. */}
            تحدث إلى الأطباء عبر الإنترنت واحصل على المشورة الطبية والوصفات الطبية عبر الإنترنت في غضون دقائق. خدمات الرعاية الصحية عند الطلب في متناول يدك.
          </p>
          {
            role == "doctor"  ? null :         
          (<button
            className="text-appointment-btn"
            type="button"
            onClick={handleBookAppointmentClick}
          >
            <FontAwesomeIcon icon={faCalendarCheck} />
             {/* Book Appointment */}
             حجز موعد
          </button>)}
          <div className="text-stats">
            <div className="text-stats-container">
              <p>145k+</p>
              {/* <p>Receive Patients</p> */}
              <p>استقبال المرضى</p>

            </div>

            <div className="text-stats-container">
              <p>50+</p>
              {/* <p>Expert Doctors</p> */}
              <p>أطباء ذو خبرة</p>

            </div>

            <div className="text-stats-container">
              <p>10+</p>
              {/* <p>Years of Experience</p> */}
              <p>سنين من الخبرة</p>

            </div>
          </div>
        </div>

        <div className="hero-image-section">
          <img className="hero-image1" src={Doctor} alt="Doctor" />
        </div>
      </div>

      <div
        onClick={scrollToTop}
        className={`scroll-up ${goUp ? "show-scroll" : ""}`}
      >
        <FontAwesomeIcon icon={faAngleUp} />
      </div>
    </div>
  );
}

export default Hero;
