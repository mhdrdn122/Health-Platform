import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    is_doctor: false,
    specialty: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email and password
    if (!validateEmail(formData.email)) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('يجب أن تكون كلمة المرور أكثر من 6 أحرف.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'حدث خطأ ما. يرجى المحاولة مرة أخرى.');
        return;
      }

      const data = await response.json();
      console.log(data);
      navigate('/login');
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      toast.error('حدث خطأ ما. يرجى المحاولة مرة أخرى.');
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  return (
    <div className="container auth"  dir='ltr'>
      <div className="screen">
        <div className="screen__content">
          <form onSubmit={handleSubmit} className="login" style={{paddingTop:"35px"}}>
            <div className="login__field">
              <i className="login__icon fas fa-user"></i>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="الاسم الأول"
                required
                className='login__input'
              />
            </div>
            <div className="login__field">
              <i className="login__icon fas fa-lock"></i>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="الاسم الآخر"
                required
                className='login__input'
              />
            </div>
            <div className="login__field">
              <i className="login__icon fas fa-lock"></i>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ادخل الايميل الخاص بك "
                required
                className='login__input'
              />
            </div>
            <div className="login__field">
              <i className="login__icon fas fa-lock"></i>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="كلمة المرور"
                required
                className='login__input red'
              />
            </div>
            <label>
              <input
                type="checkbox"
                name="is_doctor"
                checked={formData.is_doctor}
                onChange={handleChange}
              />
              هل أنت طبيب?
            </label>
            {formData.is_doctor && (
              <select name="specialty" value={formData.specialty} onChange={handleChange}>
                <option value="">Select Specialty</option>
                <option value="Brain Cancer">Brain Cancer</option>
                <option value="Skin Cancer">Skin Cancer</option>
              </select>
            )}
            <button type="submit" className="button login__submit">
              <span className="button__text">تسجيل</span>
              <i className="button__icon fas fa-chevron-right"></i>
            </button>
          </form>
          <p>هل لديك حساب؟ <Link to="/login">تسجيل الدخول</Link></p>
        </div>
        <div className="screen__background">
          <span className="screen__background__shape screen__background__shape4"></span>
          <span className="screen__background__shape screen__background__shape3"></span>
          <span className="screen__background__shape screen__background__shape2"></span>
          <span className="screen__background__shape screen__background__shape1"></span>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Register;
