import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white py-1 text-xs px-4 flex justify-between items-center">
      <div>
        <span>Last updated: May 25, 2023</span>
      </div>
      <div>
        <span>Data source: Porto Alegre Municipal Weather Service</span>
      </div>
    </footer>
  );
};

export default Footer;
