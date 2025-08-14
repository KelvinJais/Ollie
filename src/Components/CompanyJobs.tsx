import { Badge } from "@/Components/ui/badge";
import { useState } from "react";
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
  threshold,
  firstVisit,
  jobListings,
  showOnlyNew,
}: {
  company: string;
  threshold: number;
  firstVisit: boolean;
  jobListings: Job[];
  showOnlyNew: boolean;
}) {
  const [clickedJobIds, setClickedJobIds] = useState<string[]>(() => {
    const hasClicked = localStorage.getItem("hasClicked");
    if (!hasClicked) return [];
    try {
      const parsed = JSON.parse(hasClicked);
      // parsed is an object like { jobid1: true, jobid2: true }
      return Object.keys(parsed).filter((jobId) => parsed[jobId]);
    } catch {
      return [];
    }
  });

  console.log("firstVisit", firstVisit);

  if (firstVisit) {
    jobListings.forEach((job) => {
      const jobKey = job.jobId ? job.jobId : job.url;
      const seenJobsStr = localStorage.getItem("seen_jobs");
      let seenJobs: { [key: string]: string } = {};
      if (seenJobsStr) {
        try {
          seenJobs = JSON.parse(seenJobsStr);
        } catch (e) {
          seenJobs = {};
        }
      }
      if (!seenJobs[jobKey]) {
        markJobAsSeen(job);
      }
    });
  }

  const companyName = capitalizeFirstLetter(company);
  if (!jobListings || jobListings.length === 0) {
    return <></>;
  }
  // Filter jobs based on showOnlyNew state
  const filteredJobs = showOnlyNew
    ? jobListings.filter((job) => {
        const status = isJobNew(job);
        return status === "Brand new" || status === "New";
      })
    : jobListings;

  if (!filteredJobs || filteredJobs.length === 0) {
    return <></>;
  }

  function markJobAsSeen(job: Job) {
    console.log("marking ", job.title);
    const jobKey = job.jobId ? job.jobId : job.url;
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
    console.log("marked ", job.title);
    localStorage.setItem("seen_jobs", JSON.stringify(seenJobs));
    // Add the job id (or url) to clickedJobIds state if not already present
  }

  function isJobNew(job: Job): "Brand new" | "New" | "Old" {
    const jobKey = job.jobId ? job.jobId : job.url;

    if (firstVisit) {
      const detectedTime = new Date(job.detected);
      const now = new Date();
      const diffMs = now.getTime() - detectedTime.getTime();
      const diffMinutes = diffMs / 60000;
      return diffMinutes <= threshold ? "New" : "Old";
    }

    const seenJobsStr = localStorage.getItem("seen_jobs");
    let seenJobs: { [key: string]: string } = {};

    if (!seenJobsStr) {
      return "Old";
    } else {
      try {
        seenJobs = JSON.parse(seenJobsStr);
      } catch (e) {
        seenJobs = {};
      }
    }
    if (!(jobKey in seenJobs)) {
      markJobAsSeen(job);
      return "Brand new";
    }
    // If the job was seen, check if it was seen less than 15 minutes ago
    const seenTime = new Date(seenJobs[jobKey]);
    const now = new Date();
    const diffMs = now.getTime() - seenTime.getTime();
    const diffMinutes = diffMs / 60000;
    //console.log(seenTime, now, job.title, diffMinutes);
    return diffMinutes <= threshold ? "New" : "Old";
  }

  // Mark all jobs that aren't seen as seen when component mounts or jobListings change
  function jobStatusBadge(job: Job) {
    switch (isJobNew(job)) {
      case "Brand new":
        return <Badge className="bg-red-600 text-gray-800 h-[40px]">New</Badge>;
      case "New":
        return (
          <Badge className="bg-amber-200 text-gray-800 h-[40px]">New</Badge>
        );
      case "Old":
        return <></>;
      default:
        return <></>;
    }
  }

  // Mark all "Brand new" jobs as seen
  /*filteredJobs.forEach((job) => {
    if (isJobNew(job) === "Brand new") {
      markJobAsSeen(job);
    }
  });*/

  function markJobAsClicked(job: Job) {
    if (!job.jobId) return;
    const clickedJobsStr = localStorage.getItem("hasClicked");
    let clickedJobs: { [key: string]: boolean } = {};
    if (clickedJobsStr) {
      try {
        clickedJobs = JSON.parse(clickedJobsStr);
      } catch (e) {
        clickedJobs = {};
      }
    }
    clickedJobs[job.jobId] = true;
    localStorage.setItem("hasClicked", JSON.stringify(clickedJobs));
    // Also add the job to the state hasClicked
    setClickedJobIds((prev) => {
      const jobKey = job.jobId ? job.jobId : job.url;
      if (!prev.includes(jobKey)) {
        return [...prev, jobKey];
      }
      return prev;
    });
  }

  function isJobClicked(job: Job): boolean {
    const jobKey = job.jobId ? job.jobId : job.url;
    return clickedJobIds.includes(jobKey);
  }

  return (
    <div className="md:flex bg-gray-100 rounded-2xl p-3 mb-3 ">
      <div className="min-w-[150px] mb-6">
        <h2 className="text-2xl ">{companyName}</h2>
        <p className="text-sm text-gray-500 ">
          Total Jobs: {filteredJobs.length}
        </p>
      </div>
      <ul className="w-full">
        {filteredJobs.map((job) => (
          <li key={job.jobId}>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              onClick={() => markJobAsClicked(job)}
            >
              <div
                className={`flex p-2 justify-between my-2 rounded-lg ${
                  isJobClicked(job)
                    ? "bg-blue-100 hover:bg-blue-200"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{job.title}</span>
                  <p className="text-sm text-gray-500">
                    {timeDiffFromNow(job.detected)}
                  </p>
                </div>
                {jobStatusBadge(job)}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default CompanyJobs;
