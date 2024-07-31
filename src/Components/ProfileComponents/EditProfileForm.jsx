import React from 'react';

const EditProfileForm = ({ formData, handleInputChange, handleFileChange, handleSubmit, role }) => {
  return (
    <form className="edit-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="first_name"
        value={formData.first_name}
        onChange={handleInputChange}
        required
      />
      <input
        type="text"
        name="last_name"
        value={formData.last_name}
        onChange={handleInputChange}
        required
      />
      {role !== "patient" && (
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          required
        />
      )}
      <input type="file" name="profile_pic" onChange={handleFileChange} />
      <button type="submit" className="save-button">Save</button>
    </form>
  );
};

export default EditProfileForm;
