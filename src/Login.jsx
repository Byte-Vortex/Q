import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Lottie from 'react-lottie';
import animationData from './Components/login.json'; 
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkTokenExpiration = async () => {
            try {
                const jwt_decode = (await import('jwt-decode')).default;
                const token = localStorage.getItem('token');
                if (token) {
                    const decodedToken = jwt_decode(token);
                    const currentTime = Date.now() / 1000;
                    if (decodedToken.exp < currentTime) {
                        localStorage.removeItem('token');
                        console.log('Token has expired and has been removed from local storage.');
                        navigate('/login');
                    }
                }
            } catch (error) {
                console.error('Error while decoding token:', error);
            }
        };
    
        checkTokenExpiration(); // Initial check on component mount
        const interval = setInterval(checkTokenExpiration, 60000); // Check every 60 seconds
    
        return () => clearInterval(interval); // Clean up interval on component unmount
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/users/login', { username, password });
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                setTimeout(() => {
                    setLoading(false); 
                    navigate('/dashboard'); 
                }, 500);
            } else {
                setLoading(false);
                setError('Invalid username or password');
                setTimeout(() => {
                    setError('');
                }, 3000);
            }
        } catch (error) {
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
        <div className="Login-Container">
            {loading && (
                <div className="loading-logo">
                    <Lottie options={defaultOptions} height={100} width={100} />
                </div>
            )}
            <div className='Body-Container'>
            <img className='image' src="/favicon.png" alt="" />
            <h2 className='h2-nwr'>North Western Railways</h2>
            <form className="Login-Form" onSubmit={handleSubmit}>
            
            <h2>Login</h2>
                <div className='Detailcontainer'>
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

export default Login;