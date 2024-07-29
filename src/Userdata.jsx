import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Userdata.css';
import Lottie from 'react-lottie';
import logoutAnimationData from './Components/logout.json';
import { useNavigate } from 'react-router-dom';

const Userdata = ({ authToken }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogout, setIsLogout] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/getUsers', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
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
  const logoutOptions = {
    loop: true,
    autoplay: true,
    animationData: logoutAnimationData,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
    }
  };

  const  notify = function(msg) {
      let notification = document.getElementById("notification");
      notification.innerHTML = msg;
      notification.classList.remove("hidden");
      notification.classList.add("visible");
      setTimeout(() => {
          notification.classList.remove("visible");
          notification.classList.add("hidden");
      }, 2000);
  }

  const handleadduser = () => {
    document.getElementById('adduser').hidden = false;
    document.getElementById('removeuser').hidden = true;
    setIsHidden(true);
  }
  
  const handleremoveuser = () => {
    document.getElementById('adduser').hidden = true;
    document.getElementById('removeuser').hidden = false;
    setIsHidden(true);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    addUser();
  }

  const addUser = async () => {
    try {
      const response = await axios.post('http://localhost:5000/addUser', { username, password }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      notify('User Added Successfully !')
      fetchUsers(); // Refresh the user list after adding a new user
      setUsername('');
      setPassword('');
    } catch (error) {
      notify('Use another Username or Password for User')
      console.error('Error adding user:', error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/deleteUser/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      notify('User Deleted Successfully !')
      fetchUsers(); // Refresh the user list after deleting a user
    } catch (error) {
      notify("Error deleting user")
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className='backgroundcontainer'>
      <div className="container">  
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
      {!isHidden && (
        <div className='usermanage' id='usermanage' hidden>
          <h1 className='nwr'>North Western Railways</h1>
          <h1 className='umd'>Users Management Dashboard</h1>
          <div className='usermanagebutton'>
            <button className='userbutton' onClick={handleadduser}>Register User</button>
            <button className='userbutton' onClick={handleremoveuser}>Remove User</button>
          </div>
        </div>
      )}
      <div className="add-user"id='adduser' hidden>
        <h3 className='adduser'>Add User</h3>
          <form className='detail' onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Add User</button>
          </form>
        </div>
        <div className='removeuser' id='removeuser' hidden>
            <h2 className='displayuser'>Users List</h2>
              <table>
                <thead>
                  <tr>
                    <th className='username'>Username</th>
                    <th>Connection ID</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className='userid'>{user.username}</td>
                      <td className='connectioncode'>{user.connectionId}</td>
                      <td className='delbutton'>
                        <button className='delete' onClick={() => deleteUser(user._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div> 
      </div>
    </div>
  );
};

export default Userdata;
