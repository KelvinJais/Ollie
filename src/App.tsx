import Header from "./Components/Header";
import Filter from "./Components/Filter";
import CompanyJobs from "./Components/CompanyJobs";
import { useEffect, useState } from "react";
import SkeletonLoader from "./Components/SkeletonLoader";

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

  const threshold = 15;
  const firstTime = localStorage.getItem("firstTime");
  let firstVisit = false;
  if (!firstTime) {
    firstVisit = true;
    localStorage.setItem("firstTime", new Date().toISOString());
  } else {
    const firstTimeDate = new Date(firstTime);
    const now = new Date();
    const diffMs = now.getTime() - firstTimeDate.getTime();
    const diffMinutes = diffMs / (60 * 1000);
    if (diffMinutes < threshold) {
      firstVisit = true;
    }
  }
  // Instantiate a new key in localStorage 'seen_jobs' if it doesn't exist
  if (!localStorage.getItem("seen_jobs")) {
    localStorage.setItem("seen_jobs", JSON.stringify({}));
  }

  if (loading) return <SkeletonLoader />;
  if (error) return <div>Error: {error.message}</div>;
  if (!data || !data.jobs) return <div>No data available</div>;
  return (
    <div className="max-w-4xl mx-auto p-8">
      <Header></Header>
      <Filter showOnlyNew={showOnlyNew} toggle={toggleShowNew}></Filter>
      {Object.entries(data.jobs).map(([company, jobs]) => (
        <CompanyJobs
          firstVisit={firstVisit}
          threshold={threshold}
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
