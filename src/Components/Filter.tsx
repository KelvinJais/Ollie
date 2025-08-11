import { Button } from "@/Components/ui/button";

type FilterProps = {
  showOnlyNew: boolean;
  toggle: () => void;
};

function Filter({ showOnlyNew, toggle }: FilterProps) {
  const clearLocalStorage = () => {
    localStorage.clear();
  };

  return (
    <div className="flex  gap-4 bg-gray-100 rounded-2xl py-3 px-4 mb-4">
      <Button
        onClick={toggle}
        className={`${
          showOnlyNew
            ? "bg-green-500 hover:bg-green-600"
            : "bg-gray-400 hover:bg-gray-500"
        }`}
      >
        New
      </Button>
      <Button
        onClick={clearLocalStorage}
        className="bg-red-500 hover:bg-red-600"
        variant="destructive"
      >
        Clear Local Storage
      </Button>
    </div>
  );
}
export default Filter;
