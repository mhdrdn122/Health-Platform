import React, { useState } from 'react';
import axios from 'axios';
import './verification.css';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../auth';

const Verification = () => {
  const { handleSendNotification } = useAuth();

    const doctorId = useParams()
  console.log(doctorId)
  const [formData, setFormData] = useState({
    user_id:doctorId.id,
    fullName: '',
    birthDate: '',
    address: '',
    phoneNumber: '',
    email: '',
    clinicAddress: '',
    degree: '',
    degreeCertificate: null,
    licenseNumber: '',
    licenseCertificate: null,
    issuingAuthority: '',
    experienceYears: '',
    previousWorkplaces: '',
    professionalMembership: '',
    membershipNumber: '',
    profilePicture: null,
    identityDocument: null
  });

  
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    try {
      const response = await axios.post('http://localhost:5000/verify_doctor', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      handleSendNotification("1","قام طبيب جديد بالتسجيل معلوماته بإنتظار  التوثيق")
      console.log(response.data);
    } catch (error) {
      console.error('Error during verification:', error);
    }
  };

  return (
    <div className="verification-container">
      <h1>توثيق الحساب</h1>
      <form onSubmit={handleSubmit}>
        <label>الاسم الكامل:</label>
        <input type="text" name="fullName" onChange={handleChange} required />

        <label>تاريخ الميلاد:</label>
        <input type="date" name="birthDate" onChange={handleChange} required />

        <label>عنوان السكن:</label>
        <input type="text" name="address" onChange={handleChange} required />

        <label>رقم الهاتف:</label>
        <input type="tel" name="phoneNumber" onChange={handleChange} required />

        <label>البريد الإلكتروني:</label>
        <input type="email" name="email" onChange={handleChange} required />

        <label>عنوان العيادة أو مكان العمل:</label>
        <input type="text" name="clinicAddress" onChange={handleChange} required />

        <label>الشهادة الأكاديمية:</label>
        <input type="text" name="degree" onChange={handleChange} required />

        <label>شهادة التخرج:</label>
        <input type="file" name="degreeCertificate" onChange={handleChange} required />

        <label>رقم الترخيص الطبي:</label>
        <input type="text" name="licenseNumber" onChange={handleChange} required />

        <label>صورة من ترخيص الممارسة الطبية:</label>
        <input type="file" name="licenseCertificate" onChange={handleChange} required />

        <label>اسم الجهة التي أصدرت الترخيص:</label>
        <input type="text" name="issuingAuthority" onChange={handleChange} required />

        <label>عدد سنوات الخبرة:</label>
        <input type="number" name="experienceYears" onChange={handleChange} required />

        <label>الأماكن التي عملت فيها سابقاً:</label>
        <textarea name="previousWorkplaces" onChange={handleChange} required></textarea>

        <label>عضوية في الجمعيات أو النقابات الطبية:</label>
        <input type="text" name="professionalMembership" onChange={handleChange} required />

        <label>رقم العضوية:</label>
        <input type="text" name="membershipNumber" onChange={handleChange} required />

        <label>صورة شخصية حديثة:</label>
        <input type="file" name="profilePicture" onChange={handleChange} required />

        <label>صورة من جواز السفر أو بطاقة الهوية:</label>
        <input type="file" name="identityDocument" onChange={handleChange} required />

        <button type="submit">إرسال</button>
      </form>
    </div>
  );
};

export default Verification;
