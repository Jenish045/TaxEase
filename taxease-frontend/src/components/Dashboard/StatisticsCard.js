import React from 'react';
import './Dashboard.css';

const StatisticsCard = ({ title, value, icon, color }) => {
  return (
    <div className={`statistics-card statistics-card-${color}`}>
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-value">{value}</p>
      </div>
    </div>
  );
};

export default StatisticsCard;