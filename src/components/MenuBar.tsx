import { useState } from "react";
import { Menu } from 'lucide-react'
import Link from "next/link";

const MenuBar: React.FC = () => {
    const [menu, setMenu] = useState(false);
    const menuToggle = () => {
      setMenu(!menu);
    };
    return (
        <>
        <Menu
        className="absolute right-3 z-50 top-3 bg-opacity-25 hover:cursor-pointer md:hidden"
        color="black"
        size={50}
        onClick={menuToggle}
      />
      {menu ? (
        <div className={`z-60 relative right-0 top-0 ease-in-out duration-300`}>
          <div
            className="absolute right-0 top-0 h-screen w-screen bg-black bg-opacity-70"
            onClick={menuToggle}
          ></div>
          <div className="absolute right-0 top-0 h-screen w-4/6 bg-[#a388ee]">
            <div className="flex h-full flex-col items-center justify-center space-y-10 text-yellow-200 ">
              <Link
                href="/"
                className="font-mono text-3xl font-bold hover:bg-white text-stroke-1"
              >
                Home
              </Link>
              <Link
                href="/user-profile"
                className="font-mono text-3xl font-bold hover:underline text-stroke-1"
              >
                Profile
              </Link>
              <a
                href="/user-profile"
                className="font-mono text-3xl font-bold hover:underline text-stroke-1"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      ) : null}
      </>
    )
}

export default MenuBar