import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './chatlist.css';
import { useNavigate, useParams } from 'react-router-dom';

const ChatList = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newMessages, setNewMessages] = useState({});
    const navigate = useNavigate();
    const endPoint = useParams();
    const userId = endPoint.id;

    useEffect(() => {
        fetchChatList();
    }, [userId]);

    const fetchChatList = () => {
        console.log(userId)
        axios.get(`http://localhost:5000/api/chatlist/${userId}`)
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the user list!', error);
            });
    };

    const handleUserClick = (userId) => {
        navigate(`/chat/${userId}`);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredUsers = users.filter(user => 
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        // Simulate receiving a new message
        const interval = setInterval(() => {
            const randomUserId = users[Math.floor(Math.random() * users.length)]?.id;
            if (randomUserId) {
                setNewMessages(prevState => ({
                    ...prevState,
                    [randomUserId]: true
                }));
                fetchChatList();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [users]);

    return (
        <div className="chat-list">
            <h2>Chat List</h2>
            <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={handleSearch} 
                className="chat-list-search"
            />
            <ul>
                {filteredUsers.map(user => (
                    <li 
                        key={user.id} 
                        onClick={() => handleUserClick(user.id)} 
                        className={`chat-list-item ${newMessages[user.id] ? 'new-message' : ''}`}
                    >
                        <div className="chat-list-user">
                            <div className="chat-list-user-info">
                                <span className="chat-list-user-name">{user.first_name} {user.last_name}</span>
                                <span className="chat-list-user-email">({user.email})</span>
                            </div>
                            <div className="chat-list-message-info">
                                <span className="chat-list-last-message">{user.last_message_content}</span>
                                <span className="chat-list-last-message-time">{new Date(user.last_message_timestamp).toLocaleString()}</span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ChatList;
