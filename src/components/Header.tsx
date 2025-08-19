import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="w-full py-4 px-8 flex items-center justify-between">
      <div className="flex items-center">
        <div className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm">
          STORIQ
        </div>
      </div>
      
      <nav className="hidden md:flex items-center space-x-8">
        <a href="/" className="text-white hover:text-storiq-purple-light transition-colors">
          Home
        </a>
        <a href="/about" className="text-white hover:text-storiq-purple-light transition-colors">
          About
        </a>
        <a href="/tools" className="text-white hover:text-storiq-purple-light transition-colors">
          Tools
        </a>
      </nav>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" className="text-white hover:text-storiq-purple-light">
          SIGN IN
        </Button>
      </div>
    </header>
  );
};

export default Header;