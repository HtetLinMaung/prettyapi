import { useState } from "react";

export default function Menu({ children, items, onSelected = () => {} }) {
  const [flag, setFlag] = useState(false);

  return (
    <div
      className="inline-block relative cursor-pointer"
      onClick={() => {
        setFlag(!flag);
      }}
    >
      {children}
      <div
        className="text-black z-50 p-2 absolute rounded-xl w-32 bg-white shadow-2xl ease-in-out duration-300 mt-1"
        style={{ transform: flag ? "scale(1)" : "scale(0)" }}
      >
        {items.map((item, i) => (
          <div
            onClick={() => onSelected(item, i)}
            key={i}
            className="text-center text-sm py-2 ease-in-out duration-300 hover:bg-gray-100 rounded-lg"
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
