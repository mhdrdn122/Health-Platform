import React from 'react';

const ProfileBio = ({ doctor }) => {
  return (
    <div className="profile-bio">
      <h2>السيرة الذاتية</h2>
      <p>{doctor.bio}</p>
    </div>
  );
};

export default ProfileBio;
