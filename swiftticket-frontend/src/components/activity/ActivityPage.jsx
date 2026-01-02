import React from 'react';
import { Activity as ActivityIcon } from 'lucide-react';
import ActivityFeed from './ActivityFeed';
import './ActivityPage.css';

const ActivityPage = () => {
  return (
    <div className="activity-page-container">
      <div className="activity-page-header">
        <ActivityIcon size={32} />
        <h1>Activity Log</h1>
      </div>

      <div className="activity-page-content">
        <ActivityFeed />
      </div>
    </div>
  );
};

export default ActivityPage;