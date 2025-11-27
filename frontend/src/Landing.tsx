import { Link } from 'react-router-dom';
import { WavyBackground } from "@/components/ui/shadcn-io/wavy-background";

const WAVY_COLORS = ["#22d3ee", "#4ade80", "#2563eb"];

function Landing() {
  return (
    <WavyBackground 
      className="w-full flex-grow flex flex-col"
      containerClassName="justify-start"
      backgroundFill="black"
      colors={WAVY_COLORS}
      waveOpacity={0.5}
      blur={10}
    >
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-6 py-6 md:px-12 z-50">
        <div className="flex items-center gap-2">
          <img src="/header.png" alt="FinanceTracker Logo" className="h-12 w-auto" />
          <span className="text-2xl font-bold text-white tracking-tighter">Finance<span className="text-green-400">Tracker</span></span>
        </div>
        <div className="flex gap-6 items-center">
           <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
             Login
           </Link>
           <Link to="/register" className="hidden md:block text-sm font-medium text-black bg-white hover:bg-slate-200 px-5 py-2.5 rounded-full transition-colors">
             Sign Up
           </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-slate-700 bg-slate-900/50 backdrop-blur-md text-slate-300 text-sm font-medium">
           Smart Financial Management
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-6">
          Master Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
            Money Flow
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Experience the future of personal finance. Track expenses, visualize spending patterns, and achieve your financial goals with our intelligent platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center w-full justify-center">
          <Link 
            to="/register" 
            className="w-full sm:w-auto px-8 py-4 bg-green-500 hover:bg-green-600 text-black font-bold rounded-full transition-all transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(74,222,128,0.4)] flex items-center justify-center gap-2"
          >
            Get Started
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>

      </div>
      </WavyBackground>
  );
}export default Landing;