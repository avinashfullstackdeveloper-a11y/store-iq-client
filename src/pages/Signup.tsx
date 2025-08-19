import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Signup = () => {
  return (
    <div className="min-h-screen bg-storiq-dark flex">
      {/* Left Side - Welcome Message */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="max-w-xl">
          {/* STORIQ Logo */}
          <div className="mb-8">
            <div className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm inline-block">
              STORIQ
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Roll the Carpet.!
          </h1>
          
          <div className="border border-white/20 rounded-lg px-4 py-2 inline-block mb-8">
            <span className="text-white/80 italic">Skip the lag ?</span>
            <div className="border-t border-dashed border-white/30 mt-2"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center px-8 relative">
        {/* Background gradient orb */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-storiq-purple/40 to-storiq-blue/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-storiq-blue/30 to-storiq-purple/30 rounded-full blur-3xl"></div>

        <div className="bg-storiq-card-bg/80 backdrop-blur-xl border border-storiq-border rounded-3xl p-8 w-full max-w-md relative">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Signup</h2>
            <p className="text-white/60">Just some details to get you in.!</p>
          </div>

          <form className="space-y-6">
            <div>
              <Input 
                type="text" 
                placeholder="Username"
                className="w-full"
              />
            </div>
            
            <div>
              <Input 
                type="text" 
                placeholder="Email / Phone"
                className="w-full"
              />
            </div>

            <div>
              <Input 
                type="password" 
                placeholder="Password"
                className="w-full"
              />
            </div>

            <div>
              <Input 
                type="password" 
                placeholder="Confirm Password"
                className="w-full"
              />
            </div>

            <Button variant="gradient" className="w-full py-3 rounded-xl text-lg">
              Signup
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-storiq-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-storiq-card-bg px-4 text-white/60">Or</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="flex justify-center space-x-4">
              <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                <span className="text-xl">G</span>
              </button>
              <button className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                <span className="text-white text-xl">f</span>
              </button>
              <button className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                <span className="text-white text-xl">⚫</span>
              </button>
            </div>

            <div className="text-center text-white/60">
              Already Registered? 
              <a href="/login" className="text-storiq-purple hover:text-storiq-purple-light ml-1">
                Login
              </a>
            </div>

            <div className="flex justify-center space-x-6 text-sm text-white/50">
              <a href="#" className="hover:text-white">Terms & Conditions</a>
              <a href="#" className="hover:text-white">Support</a>
              <a href="#" className="hover:text-white">Customer Care</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;