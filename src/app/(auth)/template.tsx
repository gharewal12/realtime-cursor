import React from 'react';

interface TemplateProps {
  children: React.ReactNode;
}

const TemplateProps: React.FC<TemplateProps> = ({ children }) => {
  return (
    <div
      className="
        h-screen
        p-6
        flex
        justify-center
      "
    >
      {children}
    </div>
  );
};

export default TemplateProps;
