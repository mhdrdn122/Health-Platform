import React, { useEffect, useState } from "react";
import DoctorCard from "./DoctorCard";
import "../Styles/Doctors.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [id , setId] = useState()

  useEffect(() => {
    axios.get('http://localhost:5000/doctors', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      setDoctors(response.data);
    })
    .catch(error => {
      console.error('There was an error fetching the doctors!', error);
    });
    setId(auth.sub.id)
  }, []);

  const mapingDoctor = doctors.filter(doctor => doctor.id !=id).slice(0, 3).map((doctor) => {
    const imgSrc = doctor.profile_pic 
      ? `data:image/jpeg;base64,${btoa(doctor.profile_pic)}`
      : 'icon'; // يمكن استبدال هذا بمسار صورة افتراضية

    return (
      <Link key={doctor.id} className="doctor-link" to={`profile/${doctor.id}`}>
        <DoctorCard 
          img={imgSrc}
          name={`${doctor.first_name} ${doctor.last_name}`}
          title={doctor.specialty}
        />
      </Link>
    );
  });

  const handleNavigate = () => {
    auth ? navigate("/doctors") : navigate("/login");
  };

  return (
    <div className="doctor-section" id="doctors">
      <div className="dt-title-content">
        <h3 className="dt-title">
          <span>‏تعرف على أطبائنا‏</span>
        </h3>
        <p className="dt-description">
          ‏تعرف على فريقنا الاستثنائي من الأطباء المتخصصين المكرسين لتقديم خدمات رعاية صحية من الدرجة الأولى في هيلث بلس. ثق في معرفتهم وخبراتهم لتقودك نحو حياة أكثر صحة وسعادة.‏
        </p>
      </div>

      <div className="dt-cards-content">
        {mapingDoctor}
      </div>
      <button onClick={handleNavigate} className="text-appointment-btn btn-doctors">
        استعرض الفريق الطبي
      </button>
    </div>
  );
}

export default Doctors;
