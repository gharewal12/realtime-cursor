'use client';
import { Menu } from 'lucide-react';
import React, { useState } from 'react';
import PageIcon from '../icons/pageIcon';
import clsx from 'clsx';

interface MobileSidebarProps {
  children: React.ReactNode;
}

export const nativeNavigations = [
  {
    title: 'Sidebar',
    id: 'sidebar',
    customIcon: Menu,
  },
  {
    title: 'Pages',
    id: 'pages',
    customIcon: PageIcon,
  },
] as const;

const MobileSidebar: React.FC<MobileSidebarProps> = ({ children }) => {
  const [selectedNav, setSelectedNav] = useState('');

  return (
    <>
      {selectedNav === 'sidebar' && <>{children}</>}
      <nav
        className="
        bg-black/10
        backdrop-blur-lg
        sm:hidden
        fixed
        z-50
        bottom-0
        right-0
        left-0
      "
      >
        <ul
          className="
          flex
          justify-between
          items-center
          p-4  
          "
        >
          {nativeNavigations.map((nav) => (
            <li
              className="
              flex
              items-center
              flex-col
              justify-center  
              "
              key={nav.id}
              onClick={() => setSelectedNav(nav.id)}
            >
              <nav.customIcon></nav.customIcon>
              <small
                className={clsx('', {
                  'text-muted-foreground': selectedNav !== nav.id,
                })}
              >
                {nav.title}
              </small>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default MobileSidebar;
