import { Badge } from "@/Components/ui/badge";
import { useEffect } from "react";
type Job = {
  jobId?: string; // some jobs have jobId, some only url as ID
  title: string;
  url: string;
  detected: string; // ISO date string
  //posted_date?: string;   // optional, only Walmart jobs have this
};

function capitalizeFirstLetter(companyName: string): string {
  if (!companyName) return "";
  return companyName.charAt(0).toUpperCase() + companyName.slice(1);
}

function timeDiffFromNow(isoDateStr: string): string {
  const past = new Date(isoDateStr);
  const now = new Date();
  const diffMs = now.getTime() - past.getTime();
  // Calculate total minutes difference (floor to ignore seconds)
  const totalMinutes = Math.floor(diffMs / 60000);
  // If the date is in the future or difference is less than 0 minutes, treat as 0 minutes ago
  const minutes = totalMinutes < 0 ? 0 : totalMinutes;
  if (minutes < 60) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const hourPart = `${hours} hour${hours !== 1 ? "s" : ""}`;
  const minutePart =
    remainingMinutes > 0
      ? ` and ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`
      : "";
  return `${hourPart}${minutePart} ago`;
}

function CompanyJobs({
  company,
  jobListings,
  showOnlyNew,
}: {
  company: string;
  jobListings: Job[];
  showOnlyNew: boolean;
}) {
  const companyName = capitalizeFirstLetter(company);
  if (!jobListings || jobListings.length === 0) {
    return <></>;
  }

  // Filter jobs based on showOnlyNew state
  const filteredJobs = showOnlyNew
    ? jobListings.filter((job) => isJobNew(job, true))
    : jobListings;
  if (!filteredJobs || filteredJobs.length === 0) {
    return <></>;
  }
  function isJobNew(job: Job, checkTimeDiff: boolean): boolean {
    if (!job) return false;
    // Use jobId if available, otherwise fallback to url as unique key
    const jobKey = job.jobId ? job.jobId : job.url;
    if (!jobKey) return false;
    // Check if the jobKey exists in the seen_jobs object in localStorage
    const seenJobsStr = localStorage.getItem("seen_jobs");
    let seenJobs: { [key: string]: string } = {};
    const threshold = 15; // in minutes, as per prompt
    if (!seenJobsStr) {
      // If seen_jobs does not exist, treat jobs as new if they are 15 minutes old or less
      const detectedTime = new Date(job.detected);
      const now = new Date();
      const diffMs = now.getTime() - detectedTime.getTime();
      const diffMinutes = diffMs / 60000;
      return diffMinutes <= threshold;
    } else {
      try {
        seenJobs = JSON.parse(seenJobsStr);
      } catch (e) {
        seenJobs = {};
      }
    }
    if (!(jobKey in seenJobs)) {
      return true;
    }
    // If the job was seen, check if it was seen less than 15 minutes ago
    const seenTime = new Date(seenJobs[jobKey]);
    const now = new Date();
    const diffMs = now.getTime() - seenTime.getTime();
    const diffMinutes = diffMs / 60000;
    if (checkTimeDiff) {
      return diffMinutes < threshold;
    }
    return false;
  }
  // Mark all jobs that aren't seen as seen when component mounts or jobListings change

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      jobListings.forEach((job) => {
        if (isJobNew(job, false)) {
          markJobAsSeen(job);
        }
      });
    }, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line
  }, [jobListings]);

  function markJobAsSeen(job: Job) {
    if (!job) return;
    const jobKey = job.jobId ? job.jobId : job.url;
    if (!jobKey) return;
    const seenJobsStr = localStorage.getItem("seen_jobs");
    let seenJobs: { [key: string]: string } = {};
    if (seenJobsStr) {
      try {
        seenJobs = JSON.parse(seenJobsStr);
      } catch (e) {
        seenJobs = {};
      }
    }
    seenJobs[jobKey] = new Date().toISOString();
    localStorage.setItem("seen_jobs", JSON.stringify(seenJobs));
  }

  return (
    <div className="  md:flex gap-4 bg-gray-100 rounded-2xl py-3 px-4 m-3">
      <div className="min-w-[150px] mb-6">
        <h2 className="text-2xl ">{companyName}</h2>
        <p className="text-sm text-gray-500 ">
          Total Jobs: {filteredJobs.length}
        </p>
      </div>
      <ul className="w-full">
        {filteredJobs.map((job) => (
          <li key={job.jobId}>
            <div className="flex justify-between my-2 hover:bg-gray-200  rounded-lg">
              <div className="flex flex-col">
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  {job.title}
                </a>
                <p className="text-sm text-gray-500">
                  {timeDiffFromNow(job.detected)}
                </p>
              </div>
              {isJobNew(job, true) && (
                <Badge className="bg-amber-200 text-gray-800 h-[40px]">
                  New
                </Badge>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default CompanyJobs;
