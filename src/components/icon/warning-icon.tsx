import React from "react";

// icon: https://phosphoricons.com/
const WarningIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8"
      viewBox="0 0 256 256"
      fill="currentColor"
    >
      <rect width="256" height="256" fill="none"></rect>
      <line
        x1="128"
        y1="104"
        x2="128"
        y2="144"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
      ></line>
      <path
        d="M114.2,40l-88,152A16,16,0,0,0,40,216H216a16,16,0,0,0,13.8-24l-88-152A15.9,15.9,0,0,0,114.2,40Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
      ></path>
      <circle cx="128" cy="180" r="12" fill="currentColor"></circle>
    </svg>
  );
};

export default WarningIcon;
