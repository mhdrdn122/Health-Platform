import React, { useState } from 'react';
import axios from 'axios';

const EditUser = ({ user, onClose }) => {
    const [firstName, setFirstName] = useState(user.first_name);
    const [lastName, setLastName] = useState(user.last_name);
    const [bio, setBio] = useState(user.bio);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const token = localStorage.getItem('token');
           const res = await axios.put(`http://localhost:5000/upload_user/${user.id}`, {
                first_name: firstName,
                last_name: lastName,
                bio: bio,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log(res)
            onClose();
        } catch (error) {
            console.error("There was an error updating the user!", error);
        }
    };

    return (
        <div className="edit-user">
            <h2>Edit User</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>First Name</label>
                    <input 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                    />
                </div>
                <div>
                    <label>Last Name</label>
                    <input 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                    />
                </div>
                <div>
                    <label>Bio</label>
                    <textarea 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)} 
                    />
                </div>
                <button type="submit">Save</button>
                <button type="button" onClick={onClose}>Cancel</button>
            </form>
        </div>
    );
};

export default EditUser;
