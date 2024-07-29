import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'react-lottie';
import loginAnimationData from './Components/login.json'; // Existing login animation
import logoutAnimationData from './Components/logout.json'; // New logout animation
import api from './api';
import './Dashboard.css'
import axios from 'axios'; 

const Dashboard = () => {
    const [connectionCode, setConnectionCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogout, setIsLogout] = useState(false); 
    const [showDivA, setShowDivA] = useState(true);
    const [showDivB, setShowDivB] = useState(true); 
    const navigate = useNavigate();

    useEffect(() => {
        loadScript('/script.js');
        fetchConnectionCode();
    }, []);

    const fetchConnectionCode = async () => {
        try {
            const response = await api.get('/getConnectionId');
            const code = response.data.connectionId;
            setConnectionCode(code);
            window.connectionCode = code;
        } catch (error) {
            console.error('Error fetching Connection Code:', error);
        }
    };

    const handleLogout = () => {
        setIsLogout(true);
        setLoading(true);
        setTimeout(() => {
            setLoading(false); 
            navigate('/login');
            localStorage.removeItem('token');
        }, 1000);
    };
    
    const handleHost = () => {
        window.createConnection();
        setTimeout(()=>{
            setShowDivA(true);
            setShowDivB(false);
        },3000)
        setTimeout(()=>{
            window.notify("Connection Established");
            console.log("Connection Established");
        },3200)
    };

    const handleRemote = () => {
        window.joinconnection()
        setTimeout(()=>{
            setShowDivA(false);
            setShowDivB(true);
        },1200)
    };
    
    const loadScript = (src) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
    };

    const loginOptions = {
        loop: true,
        autoplay: true,
        animationData: loginAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    const logoutOptions = {
        loop: true,
        autoplay: true,
        animationData: logoutAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    const handlestreamtohost = () => {
        window.stopScreenSharing();
        document.getElementById("screenshare-container").hidden = true;
        document.getElementById("stopscreen").hidden=true;
        document.getElementById("tohost").hidden = false;
    };

    const handlesharetohost = () => {
        window.shareScreenToHost();
        setTimeout(() => {
            document.getElementById("stopscreen").hidden = false;
        }, 8000);
    };



    return (
        <div className='background'>
            <div className='dashboard-container'>
                <div className='logout-button-div'>
                    <button onClick={handleLogout} className='logout-button'><i className="fa-solid fa-right-from-bracket"></i> LOGOUT</button>
                </div>
                <div>
                    {loading && (
                        <div className="loading-logo">
                            <Lottie options={isLogout ? logoutOptions : loginOptions} height={200} width={200} />
                        </div>
                    )}
                </div>              
                <div id="notification" className="notification hidden"></div>
                <div className="header" id='header'>
                    <div className='A' style={{display:showDivA?'flex':'none'}}>
                        <div className='connection-code-div'>
                        {connectionCode && (<p className='connection-code'>{connectionCode}<i id="check" style={{display:'inline',color:'red',transition:'.2s ease-in-out'}} className="fa-regular fa-circle-check"></i></p>)}
                        </div>
                        <div className='button'>
                            <button className="ashost" id='ashost' hidden='' type="submit" onClick={handleHost}>Connect as Host</button>
                        </div>   
                    </div>
                    <div className='B' style={{display:showDivB?'flex':'none'}}>
                    <input className='connection-id-input' id="connection-input" type="text" placeholder="Enter Connection Code"  required />
                    <div className='button'>
                        <button className="asremote" type="submit" onClick={handleRemote}>Connect as Remote</button>
                    </div>
                    </div>        
                    
                </div>
                <div className='screen-share-options' id="popup-container" >
                    <button className='sharescreentohost' id='tohost' type="submit" onClick={handlesharetohost}hidden>Share Screen with Host</button>
                    <div className='stopoptions'>
                    <button className="stopscreen" id='stopscreen' type="submit" onClick={handlestreamtohost} hidden>Stop Screen Sharing</button>
                </div>
                </div>
                
                <div className='screencontainers' >
                    <div id="screenshare-container" hidden>
                        <video height="10%" width="100%" id="screenshared-video" controls className="local-video"></video>
                    </div>  
                    <div id="remote-vid-container" hidden> 
                        <video height="10%" width="100%" id="remote-video" controls className="remote-video"></video>
                    </div>                   
                </div>
                
            </div>
        </div>
    );
};

export default Dashboard;