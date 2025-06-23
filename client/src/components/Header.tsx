const Header = () => {
  return (
    <header className="flex items-center justify-between p-3 mt-2 w-2/3 border-b rounded-full shadow-sm m-auto">
      <h1 className="text-xl font-bold">TripMandu</h1>
      <nav className="flex gap-6">
        <a
          href="#"
          className="text-sm font-medium text-gray-700 hover:text-black hover:underline"
        >
          Popular Sites
        </a>
        <a
          href="#"
          className="text-sm font-medium text-gray-700 hover:text-black hover:underline"
        >
          Map
        </a>
        <a
          href="#"
          className="text-sm font-medium text-gray-700 hover:text-black hover:underline"
        >
          Plan Itinerary
        </a>
      </nav>

      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
        LOGO
      </div>
    </header>
  );
};

export default Header;
