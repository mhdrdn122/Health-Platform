import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";

function DoctorCard(props) {
  const nameImg = props.img.split("/")
  const len = nameImg.length - 1
  console.log(nameImg)
  return (
    <div className="dt-card">
      {nameImg != "icon" ? <img src={props.img} alt={props.name} className="dt-card-img" /> :           <FontAwesomeIcon icon={faUserCircle} className="profile-icon" style={{ fontSize: "150px", border: "3px solid #0073b1", borderRadius: "50%" }} />
 }
      <p className="dt-card-name">{props.name}</p>
      <p className="dt-card-title">{props.title}</p>

      
      {/* <p className="dt-card-stars">
        <FontAwesomeIcon
          icon={faStar}
          style={{ color: "#F7BB50", paddingRight: "6px" }}
        />
        {props.stars}
        <span className="dt-card-reviews"> ({props.reviews}+ Reviews)</span>
      </p> */}
    </div>
  );
}

export default DoctorCard;
