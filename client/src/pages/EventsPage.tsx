
import Header from "../components/Header";
import FilterTabs from "../components/FilterTabs";

const EventsPage = () => {
  return (
    <div className="h-screen w-full flex flex-col">
      <Header />
      <FilterTabs />
    </div>
  );
};

export default EventsPage;
