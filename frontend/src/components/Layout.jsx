import { Link, Outlet, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, LogOut, MessageSquare, Rocket, BarChart2, Sun, Moon } from 'lucide-react';

export const Layout = () => {
  const { signOut, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

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
                className="ml-2 px-4 py-2 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
