
import { createContext, useContext, useState, useEffect } from "react";
import { type Destination, getLocationByName } from "../apiHandle/detination";


interface SearchLocationContextType {
  search: string;
  setSearch: (value: string) => void;
  searchLocations: Destination[] | null;
  selectedLocation: Destination | null;
  handleSelectLocation: (location: Destination) => void;
  clearSearch: () => void;
}


const SearchLocationContext = createContext<SearchLocationContextType | undefined>(undefined);


export const SearchLocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [search, setSearch] = useState("");
  const [searchLocations, setSearchLocations] = useState<Destination[] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Destination | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      async function searchData() {
        if (search) {
          try {
            const res = await getLocationByName(search);
            setSearchLocations(res.data);
          } catch (err) {
            console.error(err);
          }
        } else {
          setSearchLocations(null);
        }
      }
      searchData();
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  const clearSearch = () => {
    setSearch("");
    setSearchLocations(null);
  };

  const handleSelectLocation = (location: Destination) => {
    setSelectedLocation(location);
    clearSearch();
  };

  return (
    <SearchLocationContext.Provider
      value={{
        search,
        setSearch,
        searchLocations,
        selectedLocation,
        handleSelectLocation,
        clearSearch,
      }}
    >
      {children}
    </SearchLocationContext.Provider>
  );
};



export const useSearchLocation = () => {
  const context = useContext(SearchLocationContext);
  if (!context) {
    throw new Error("useSearchLocation must be used within a SearchLocationProvider");
  }
  return context;
};
