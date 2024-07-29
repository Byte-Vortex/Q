import React, { useState } from 'react';
import axios from 'axios';
import Lottie from 'react-lottie';
import setAuthToken from './utils/setAuthToken'
import animationData from './Components/login.json'; 
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css'

const AdminLogin = ({ setAuthToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/admin/login', { username, password });
      setAuthToken(response.data.token);
      setTimeout(() => {
        setLoading(false); 
        navigate('/userdata');
    }, 500);
    } catch (err) {
        setLoading(false);
        console.error('There was an error while logging in!', error);
        setError('Invalid username or password');
        setTimeout(() => {
            setError('');
        }, 4000);
    }
  };


  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
    }
};


  return (
    <div className="login-container">
    {loading && (
        <div className="loading-logo">
            <Lottie options={defaultOptions} height={100} width={100} />
        </div>
    )}
    <div className='body-container'>
    <img className='image' src="/favicon.png" alt="" />
    <h2 className='h2-nwr'>North Western Railways</h2>
    <form className="login-form" onSubmit={handleLogin}>
    
    <h2>Admin</h2>
        <div className='detailcontainer'>
        <div>
            <label>Username</label>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
        </div>
        <div>
            <label>Password</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
        </div>
        </div>
        {error && <p>{error}</p>}
        <button type="submit"><i className="fa-solid fa-right-to-bracket"></i> &nbsp;LOGIN</button>
    </form>
    </div>
</div>
  );
};

export default AdminLogin;
