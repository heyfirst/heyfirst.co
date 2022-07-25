import React, { PropsWithChildren } from "react";

type Props = {
  enableHover?: boolean;
  className?: string;
  onClick?: () => void;
};
const Tag: React.FC<PropsWithChildren<Props>> = ({
  children,
  enableHover = false,
  className = "",
  onClick = null,
}) => {
  return (
    <span
      onClick={onClick}
      className={`
        inline-block
        px-2 py-1 mb-2 mr-2
        transition-all
        border rounded-md
        ${
          enableHover
            ? `cursor-pointer hover:text-yellow-700 hover:border-yellow-700`
            : "cursor-default"
        }
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Tag;
