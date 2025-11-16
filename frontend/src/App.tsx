import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Landing from './Landing';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Profile from './Profile';
import './App.css';

const loginVariants = {
  initial: { opacity: 0, x: -100 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -300 }
};

const registerVariants = {
  initial: { opacity: 0, x: 100 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 300 }
};

const dashboardVariants = {
  initial: { opacity: 0, y: 100 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -100 }
};

const landingVariants = {
  initial: { opacity: 0, y: -100 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: 100 }
};

const profileVariants = {
  initial: { opacity: 0, x: 100 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -100 }
};

const LoadingComponent = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

function App() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {isLoading && <LoadingComponent />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div variants={landingVariants} initial="initial" animate="in" exit="out" transition={{ type: "tween", ease: "easeInOut", duration: 0.6 }}><Landing /></motion.div>} />
        <Route path="/login" element={<motion.div variants={loginVariants} initial="initial" animate="in" exit="out" transition={{ type: "tween", ease: "easeInOut", duration: 0.6 }}><Login /></motion.div>} />
        <Route path="/register" element={<motion.div variants={registerVariants} initial="initial" animate="in" exit="out" transition={{ type: "tween", ease: "easeInOut", duration: 0.6 }}><Register /></motion.div>} />
        <Route path="/dashboard" element={<motion.div variants={dashboardVariants} initial="initial" animate="in" exit="out" transition={{ type: "tween", ease: "easeInOut", duration: 0.6 }}><Dashboard /></motion.div>} />
        <Route path="/profile" element={<motion.div variants={profileVariants} initial="initial" animate="in" exit="out" transition={{ type: "tween", ease: "easeInOut", duration: 0.6 }}><Profile /></motion.div>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
