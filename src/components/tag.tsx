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
        mb-2
        mr-2 inline-block rounded-md border
        px-2
        py-1 transition-all
        ${
          enableHover
            ? `cursor-pointer hover:border-yellow-700 hover:text-yellow-700`
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
