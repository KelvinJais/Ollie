import Header from "./Components/Header";
import Filter from "./Components/Filter";
import CompanyJobs from "./Components/CompanyJobs";
import { useEffect, useState } from "react";

type Job = {
  jobId?: string; // some jobs have jobId, some only url as ID
  title: string;
  url: string;
  detected: string; // ISO date string
  //posted_date?: string;   // optional, only Walmart jobs have this
};
type Data = {
  date: string;
  jobs: {
    [company: string]: Job[];
  };
};

function App() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showOnlyNew, setshowOnlyNew] = useState(true);

  useEffect(() => {
    fetch(
      "https://allseeing-website.s3.us-east-1.amazonaws.com/data_for_website.json"
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  function toggleShowNew() {
    setshowOnlyNew(!showOnlyNew);
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data || !data.jobs) return <div>No data available</div>;
  return (
    <div className="max-w-4xl mx-auto p-8">
      <Header></Header>
      <Filter showOnlyNew={showOnlyNew} toggle={toggleShowNew}></Filter>
      {Object.entries(data.jobs).map(([company, jobs]) => (
        <CompanyJobs
          key={company}
          company={company}
          showOnlyNew={showOnlyNew}
          jobListings={jobs}
        />
      ))}
    </div>
  );
}

export default App;
