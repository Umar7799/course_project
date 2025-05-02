import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { MdDarkMode, MdLightMode } from "react-icons/md";
import Hamburger from 'hamburger-react';

const Navbar = () => {
  const { user, logout, darkToggle, toggleFunction } = useAuth();
  const [isHamburgerOpen, setHamburgerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth) {
        setHamburgerOpen(false)
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <nav id='navbar' className={darkToggle ? 'fixed w-full duration-500 bg-gray-800 rounded-b-md flex justify-between px-8 py-2 text-white bg-opacity-40 backdrop-blur-md rounded drop-shadow-lg shadow-md z-[100] top-0' : 'fixed w-full duration-500 bg-gray-400 rounded-b-md flex justify-between px-8 py-2 text-white bg-opacity-40 backdrop-blur-md rounded drop-shadow-lg shadow-md z-[100] top-0'}>
      <div className='hidden font-semibold sm:flex space-x-4 pt-2'>

        <Link className={darkToggle ? "rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white" : "rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-500 hover:text-white"} to="/">Home</Link>
        {user && user?.role === 'ADMIN' && (
          <Link className={darkToggle
            ? "rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            : "rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-500 hover:text-white"}
            to="/promoteUser">Promote users</Link>
        )}

        <Link className={darkToggle ? "rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white" : "rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-500 hover:text-white"} to="/templates">Templates</Link> {/* Link to Templates page */}
        <Link className={darkToggle ? "rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white" : "rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-500 hover:text-white"} to="/createTemplate">Create template</Link> {/* Link to Templates page */}
        <Link className={darkToggle ? "rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white" : "rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-500 hover:text-white"} to="/dashboard">Dashboard</Link> {/* Only visible to admin */}

        {!user ? (
          <>
            <Link className={darkToggle ? "rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white" : "rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-500 hover:text-white"} to="/login">Login</Link>
            <Link className={darkToggle ? "rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white" : "rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-500 hover:text-white"} to="/signup">Sign Up</Link>
          </>
        ) : (
          <>
            <Link className={darkToggle ? "rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white" : "rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-500 hover:text-white"} to="/profile">Profile</Link>
            <button className={darkToggle ? "rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white" : "rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-500 hover:text-white"} onClick={logout}><Link to='login'>Logout</Link></button>
          </>
        )}
      </div>


      <div className="hidden sm:flex ml-auto pr-4 pt-2">
        <button className='text-xl' onClick={toggleFunction}>
          {darkToggle ? <span className='text-white'><MdLightMode /></span> : <span><MdDarkMode /></span>}
        </button>
      </div>

      {/* SIDEBAR */}
      <div className='sm:hidden z-50 flex ml-auto'>
        <Hamburger className='z-50' toggled={isHamburgerOpen} size={24} duration={0.5} toggle={setHamburgerOpen} />
      </div>
      <div className={isHamburgerOpen ? 'md:hidden absolute h-[100vh] w-[60vw] text-white bg-opacity-80 backdrop-blur-md drop-shadow-lg shadow-md top-0 duration-500 right-0' : 'hidden duration-500'}>
        <div className={darkToggle ? 'h-[100vh] space-y-5 bg-gray-800 text-[18px] font-semibold text-center pt-32' : 'h-[100vh] space-y-5 bg-gray-400 text-[18px] font-semibold text-center pt-32'}>
         
          <div>
            <Link className={darkToggle ? "block rounded-md px-3 py-2 font-medium text-gray-300 hover:bg-gray-700 hover:text-white" : "block rounded-md px-3 py-2 font-medium text-gray-800 hover:bg-gray-500 hover:text-white"} to="/" onClick={() => { setHamburgerOpen(false) }}>Home</Link>
            {user && user?.role === 'ADMIN' && (
              <Link className={darkToggle
                ? "rounded-md px-3 py-2 font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                : "rounded-md px-3 py-2 font-medium text-gray-800 hover:bg-gray-500 hover:text-white"}
                to="/promoteUser" onClick={() => { setHamburgerOpen(false) }}>Promote users</Link>
            )}
            <Link className={darkToggle ? "block rounded-md px-3 py-2 font-medium text-gray-300 hover:bg-gray-700 hover:text-white" : "block rounded-md px-3 py-2 font-medium text-gray-800 hover:bg-gray-500 hover:text-white"} to="/templates" onClick={() => { setHamburgerOpen(false) }}>Templates</Link> {/* Link to Templates page */}
            <Link className={darkToggle ? "block rounded-md px-3 py-2 font-medium text-gray-300 hover:bg-gray-700 hover:text-white" : "block rounded-md px-3 py-2 font-medium text-gray-800 hover:bg-gray-500 hover:text-white"} to="/createTemplate" onClick={() => { setHamburgerOpen(false) }}>Create template</Link> {/* Link to Templates page */}
          </div>

          {/* Role-based navigation */}
          {user && user?.role === 'ADMIN' && (
            <div>
              <Link className={darkToggle ? "rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white" : "rounded-md px-3 py-2 font-medium text-gray-800 hover:bg-gray-500 hover:text-white"} to="/dashboard" onClick={() => { setHamburgerOpen(false) }}>Dashboard</Link> {/* Only visible to admin */}
            </div>
          )}
          {!user ? (
            <div>
              <Link className={darkToggle ? "block rounded-md px-3 py-2 pt-1 font-medium text-gray-300 hover:bg-gray-700 hover:text-white" : "block rounded-md px-3 py-2 font-medium text-gray-800 hover:bg-gray-500 hover:text-white"} to="/login" onClick={() => { setHamburgerOpen(false) }}>Login</Link>
              <Link className={darkToggle ? "block rounded-md px-3 py-2 pt-4 font-medium text-gray-300 hover:bg-gray-700 hover:text-white" : "block rounded-md px-3 py-2 font-medium text-gray-800 hover:bg-gray-500 hover:text-white"} to="/signup" onClick={() => { setHamburgerOpen(false) }}>Sign Up</Link>
            </div>
          ) : (
            <div>
              <h1 className={darkToggle ? "rounded-md px-3 py-2 font-medium text-gray-300 hover:bg-gray-700 hover:text-white" : "rounded-md px-3 py-2 font-medium text-gray-800 hover:bg-gray-500 hover:text-white"} onClick={() => { setHamburgerOpen(false) }}><Link to="/profile">Profile</Link></h1>
              <h1 className={darkToggle ? "cursor-pointer rounded-md px-3 py-2 font-medium text-gray-300 hover:bg-gray-700 hover:text-white" : "cursor-pointer rounded-md px-3 py-2 font-medium text-gray-800 hover:bg-gray-500 hover:text-white"} onClick={() => { logout(); setHamburgerOpen(false) }}><Link to="/login">Logout</Link></h1>
            </div>
          )}
          <div className="flex justify-center mt-4 pr-4">
            <button className='text-2xl' onClick={toggleFunction}>
              {darkToggle ? <span className='text-white'><MdLightMode /></span> : <span className='text-gray-800'><MdDarkMode /></span>}
            </button>
          </div>

        </div>
      </div>
    </nav >


    // {user && user.role === 'admin' && (
    //   <li>
    //     <Link className={darkToggle ? "rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white" : "rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-500 hover:text-white"} to="/dashboard">Dashboard</Link> {/* Only visible to admin */}
    //   </li>
    // )}

  );
};

export default Navbar;
