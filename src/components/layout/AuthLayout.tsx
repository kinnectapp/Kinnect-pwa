import React from "react";
import Logo from "../../assets/images/logo.svg";
type AuthLayoutProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  description,
}) => {
  return (
    <div className="flex flex-col px-6 pt-8 pb-6  min-h-[100dvh]   bg-white">
      {/* logo */}
      <div className="mb-6 flex items-center gap-2">
        <img src={Logo} alt="Kinnect" className="h-8 w-8" />
      </div>

      {title && (
        <div className="mb-6">
          <h1 className="text-[24px] font-semibold text-[#55288D]">{title}</h1>
          {description && (
            <p className="mt-1 text-[12px] text-[#1C1C1C]">{description}</p>
          )}
        </div>
      )}

      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
};
