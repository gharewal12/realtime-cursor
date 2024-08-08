'use client';

import { BounceLoader } from 'react-spinners';

const Loading = () => {
  return (
    <div
      className="
        bg-background
        rounded-lg
        w-full
        h-full
        flex 
        items-center 
        justify-center"
    >
      <BounceLoader color="#b6b2ff" size={50} />
    </div>
  );
};

export default Loading;
