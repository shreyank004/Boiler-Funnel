import React from 'react';
import './SelectorCommon.css';

interface HeaderProps {
  progress?: number; // Progress percentage (0-100)
}

const Header: React.FC<HeaderProps> = ({ progress = 0 }) => {
  return (
    <div className="selector-common__header">
      <div className="selector-common__logo">Test</div>
      <div className="selector-common__progress-line">
        <div 
          className="selector-common__progress-line-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Header;

