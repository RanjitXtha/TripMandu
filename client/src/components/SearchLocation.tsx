import { X } from "lucide-react";
import { useSearchLocation } from "../features/searchHook";

const SearchLocation = () => {
  const {
    search,
    setSearch,
    searchLocations,
    handleSelectLocation,
    clearSearch,
    selectedLocation,
  } = useSearchLocation();

  console.log(selectedLocation);

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        className="border border-black placeholder-black w-sm rounded-3xl py-1 px-2"
        placeholder="Search..."
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      />
      {search && (
        <button
          onClick={clearSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Clear search"
          type="button"
        >
          <X />
        </button>
      )}

      {searchLocations && searchLocations.length > 0 && (
        <ul className="mt-2 max-h-60 overflow-auto border border-gray-300 rounded-md absolute z-10 bg-white">
          {searchLocations.map((location) => (
            <li
              key={location.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectLocation(location)}
            >
              {location.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchLocation;
