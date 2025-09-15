import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from 'react-router-dom'; // Import Link

const Signup = () => {
  return (
    <div className="min-h-screen bg-storiq-dark flex flex-col relative overflow-hidden">
      {/* Background gradient orbs - now there are 5 */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-storiq-purple/30 to-storiq-blue/30 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-storiq-purple/40 to-storiq-blue/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 -right-10 w-80 h-80 bg-gradient-to-br from-storiq-blue/30 to-storiq-purple/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-48 left-1/3 w-72 h-72 bg-gradient-to-br from-storiq-blue/20 to-storiq-purple/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-10 w-96 h-96 bg-gradient-to-br from-storiq-purple/30 to-storiq-blue/30 rounded-full blur-3xl opacity-50"></div>

    {/* Header */}
<header className="absolute top-0 left-0 right-0 p-8 flex justify-start items-center z-10">
  {/* White Pill Container */}
  <div className="bg-white rounded-full flex items-center p-1.5 space-x-4">
    {/* Logo - UPDATED CLASSES HERE */}
    <h1 className="font-orbitron font-semibold text-2xl text-black pl-6">
      <Link to="/">STORIQ</Link>
    </h1>
    {/* Sign Up Button */}
    <Button
      variant="default"
      className="bg-black text-white hover:bg-gray-800 rounded-full px-5 py-2 text-sm font-semibold"
    >
      SIGN UP
    </Button>
  </div>
</header>
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Side */}
        <div className="flex-1 flex items-center justify-center px-8 z-10">
          <div className="max-w-xl">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Roll the Carpet.!
            </h1>

            <div className="border border-white/20 rounded-lg px-6 py-3 inline-block">
              <span className="text-white/70 italic text-lg">
                Skip the lag ?
              </span>
              <div className="border-t border-dashed border-white/30 mt-3"></div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 flex items-center justify-center px-8 z-10">
          {/* Signup Card */}
          <div className="bg-storiq-card-bg/80 backdrop-blur-xl border border-storiq-border rounded-3xl p-10 w-full max-w-md relative shadow-xl">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-3">Signup</h2>
              <p className="text-white/60 text-base">Just some details to get you in.!</p>
            </div>

            {/* Form */}
            <form className="space-y-6">
              <Input type="text" placeholder="Username" className="w-full" />
              <Input type="text" placeholder="Email / Phone" className="w-full" />
              <Input type="password" placeholder="Password" className="w-full" />
              <Input type="password" placeholder="Confirm Password" className="w-full" />

              {/* CTA Button */}
              <Button
                variant="gradient"
                className="w-full py-3 rounded-xl text-lg font-semibold"
              >
                Signup
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-storiq-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-storiq-card-bg px-4 text-white/60">Or</span>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button type="button" className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.617-3.276-11.283-7.94l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.244,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                </button>
                <button type="button" className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"></path></svg>
                </button>
                <button type="button" className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </button>
              </div>
              {/* Footer Links */}
              <div className="text-center text-white/60 mt-6">
                Already Registered?{" "}
                <a
                  href="/login"
                  className="text-storiq-purple hover:text-storiq-purple-light ml-1"
                >
                  Login
                </a>
              </div>

              <div className="flex justify-center space-x-6 text-sm text-white/50 mt-4">
                <a href="#" className="hover:text-white">Terms & Conditions</a>
                <a href="#" className="hover:text-white">Support</a>
                <a href="#" className="hover:text-white">Customer Care</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
