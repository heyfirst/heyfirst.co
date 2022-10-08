import React, { PropsWithChildren } from "react";
import InfoIcon from "../icon/info-icon";
import WarningIcon from "../icon/warning-icon";

type Props = {
  type: "info" | "caution";
};

const Note: React.FC<PropsWithChildren<Props>> = ({ type, children }) => {
  return (
    <div
      className={`
        relative my-4 inline-block rounded border-l-2
        px-6 pt-2
        ${type === "info" ? "border-cyan-200 bg-cyan-50" : ""}
        ${type === "caution" ? "border-orange-200 bg-orange-50" : ""}
      `}
    >
      <div
        className={`absolute -top-4 -left-3 rounded-xl bg-white p-1 text-lg
          ${type === "info" ? "text-cyan-300" : ""}
          ${type === "caution" ? "text-orange-300" : ""}
        `}
      >
        {type === "caution" && <WarningIcon />}
        {type === "info" && <InfoIcon />}
      </div>
      {children}
    </div>
  );
};

export default Note;
