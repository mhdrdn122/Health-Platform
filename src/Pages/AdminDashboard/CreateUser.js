import React, { useState } from 'react';
import axios from 'axios';

const CreateUser = ({ onUserCreated }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isDoctor, setIsDoctor] = useState(false);
    const [specialty, setSpecialty] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5000/users', {
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
            is_doctor: isDoctor,
            specialty: isDoctor ? specialty : null,
            is_admin: isAdmin
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        }).then(response => {
            onUserCreated();
        }).catch(error => {
            console.error("There was an error creating the user!", error);
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <label>
                <input type="checkbox" checked={isDoctor} onChange={(e) => setIsDoctor(e.target.checked)} />
                Is Doctor?
            </label>
            {isDoctor && <input type="text" placeholder="Specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} required />}
            <label>
                <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
                Is Admin?
            </label>
            <button type="submit">Create User</button>
        </form>
    );
};

export default CreateUser;
