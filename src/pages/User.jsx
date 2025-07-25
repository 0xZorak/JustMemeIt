import React from 'react';
import Sidebar from '../components/Sidebar';
import ProfileSection from '../components/ProfileSection';
import '../styles/user.css';

const User = () => {
    return (
        <div className="user-page">
            <Sidebar />
            <div className="container">
                <p>Profile</p>
                <ProfileSection />
                <ul className="nav-links">
                    <li>Upload</li>
                    <li><span>🎁</span> My Rewards</li>
                </ul>
            </div>
        </div>
    );
};

export default User;