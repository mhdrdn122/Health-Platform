import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import jwtDecode from 'jwt-decode';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email and password
    if (!validateEmail(email)) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح.');
      return;
    }

    if (password.length < 5) {
      toast.error('يجب أن تكون كلمة المرور أكثر من 6 أحرف.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("role", data.role);
        localStorage.setItem("verified", data.is_verifie);

        console.log(data);
        login(data.access_token, data.refresh_token);
        const redirect = location.state?.path || '/';
        switch (data.role) {
          case "patient":
            navigate(redirect, { replace: true });
            break;
          case "doctor":
            console.log(data.is_verifie)
            if (data.is_verified) {
              navigate(`/profile/${data.user_id}`, { replace: true });
            } else {
              navigate(`/verification/${data.user_id}`, { replace: true });
            }
            break;
          case "admin":
            navigate('/admin/', { replace: true });
            break;
          default:
            navigate('/', { replace: true });
        }
      } else if (response.status === 401) {
        toast.error('بيانات الاعتماد غير صالحة.');
      } else {
        toast.error('حدث خطأ ما. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      toast.error('حدث خطأ ما. يرجى المحاولة مرة أخرى.');
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  return (
    <div className="container" dir='ltr'>
      <div className="screen">
        <div className="screen__content">
          <form onSubmit={handleSubmit} className="login">
            <div className="login__field">
              <i className="login__icon fas fa-user"></i>
              <input type="email" className='login__input' placeholder="ادخل الايميل الخاص بك" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="login__field">
              <i className="login__icon fas fa-lock"></i>
              <input type="password" className='login__input' placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="button login__submit">
              <span className="button__text">تسجيل الدخول الآن</span>
              <i className="button__icon fas fa-chevron-right"></i>
            </button>
          </form>
          <p>لا تملك حساب؟ <Link to="/register">تسجيل</Link></p>
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

export default Login;
