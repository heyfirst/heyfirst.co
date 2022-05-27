import React from "react";

// icon: https://phosphoricons.com/
const InfoIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8"
      fill="currentColor"
      viewBox="0 0 256 256"
    >
      <rect width="256" height="256" fill="none"></rect>
      <circle
        cx="128"
        cy="128"
        r="96"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      ></circle>
      <polyline
        points="120 120 128 120 128 176 136 176"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      ></polyline>
      <circle cx="126" cy="84" r="12" fill="currentColor"></circle>
    </svg>
  );
};

export default InfoIcon;
