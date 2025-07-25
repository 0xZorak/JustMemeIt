import React from 'react';
import '../styles/user.css';

const ProfileSection = () => {
    return (
        <div className="container">
            <p>Profile</p>
            <div className="profile-section">
                <div className="profile-pic">
                    <img src="../images/dog.jpg" alt="User Icon" />
                </div>
                <div>
                    <p>x username</p>
                    <p>wallet address</p>
                </div>
            </div>
            <ul className="nav-links">
                <li>Upload</li>
                <li><span>🎁</span> My Rewards</li>
            </ul>
        </div>
    );
};

export default ProfileSection;