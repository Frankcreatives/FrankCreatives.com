import { useState } from 'react';
import { Link, Outlet, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, LogOut, MessageSquare, Rocket, BarChart2, Sun, Moon, Menu, X } from 'lucide-react';

export const Layout = () => {
  const { signOut, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-gray-900 flex flex-col font-sans transition-colors duration-300">
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-10 w-auto" src="/logo.png" alt="FrankCreatives" />
                <span className="ml-3 text-xl font-bold text-brand-black dark:text-white tracking-tight">FrankCreatives</span>
              </div>
              <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                <NavLink 
                  to="/" 
                  className={({isActive}) => `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${isActive ? "border-brand-green text-brand-black dark:text-white" : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-200 hover:text-gray-700 dark:hover:text-gray-200"}`}
                >
                  <Rocket className={`w-4 h-4 mr-2 ${location.pathname === '/' ? 'text-brand-green' : ''}`} />
                  Projects
                </NavLink>
                <NavLink 
                  to="/polls" 
                  className={({isActive}) => `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${isActive ? "border-brand-green text-brand-black dark:text-white" : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-200 hover:text-gray-700 dark:hover:text-gray-200"}`}
                >
                  <BarChart2 className={`w-4 h-4 mr-2 ${location.pathname === '/polls' ? 'text-brand-green' : ''}`} />
                  Polls
                </NavLink>
                <NavLink 
                  to="/feedback" 
                  className={({isActive}) => `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${isActive ? "border-brand-green text-brand-black dark:text-white" : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-200 hover:text-gray-700 dark:hover:text-gray-200"}`}
                >
                  <MessageSquare className={`w-4 h-4 mr-2 ${location.pathname === '/feedback' ? 'text-brand-green' : ''}`} />
                  My Feedback
                </NavLink>
                {isAdmin && (
                  <NavLink 
                    to="/admin" 
                    className={({isActive}) => `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${isActive ? "border-brand-green text-brand-black dark:text-white" : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-200 hover:text-gray-700 dark:hover:text-gray-200"}`}
                  >
                    <LayoutDashboard className={`w-4 h-4 mr-2 ${location.pathname === '/admin' ? 'text-brand-green' : ''}`} />
                    Admin
                  </NavLink>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button
                onClick={signOut}
                className="hidden sm:flex ml-2 px-4 py-2 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 items-center border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pt-2 pb-4 space-y-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-700">
            <NavLink
              to="/"
              onClick={closeMobileMenu}
              className={({isActive}) => `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-brand-green/10 text-brand-green' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <Rocket className="w-5 h-5 mr-3" />
              Projects
            </NavLink>
            <NavLink
              to="/polls"
              onClick={closeMobileMenu}
              className={({isActive}) => `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-brand-green/10 text-brand-green' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <BarChart2 className="w-5 h-5 mr-3" />
              Polls
            </NavLink>
            <NavLink
              to="/feedback"
              onClick={closeMobileMenu}
              className={({isActive}) => `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-brand-green/10 text-brand-green' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <MessageSquare className="w-5 h-5 mr-3" />
              My Feedback
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={closeMobileMenu}
                className={({isActive}) => `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-brand-green/10 text-brand-green' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Admin
              </NavLink>
            )}
            <button
              onClick={() => { signOut(); closeMobileMenu(); }}
              className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
