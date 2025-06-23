import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [applyingJob, setApplyingJob] = useState(null);
  const [formData, setFormData] = useState({ profileName: "", whatsapp: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/jobs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch jobs");
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error("Error fetching your jobs:", error);
      }
    };

    fetchMyJobs();
  }, [token]);

  const handleApplySubmit = async () => {
    setError(null);
    if (!formData.profileName.trim() || !formData.whatsapp.trim()) {
      setError("Both fields are required");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/jobs/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobPostId: applyingJob.id,
          profileName: formData.profileName,
          whatsappNumber: formData.whatsapp,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to apply");
      }

      alert("Application submitted successfully!");
      setApplyingJob(null);
      setFormData({ profileName: "", whatsapp: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-10">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-white drop-shadow-lg text-center md:text-left pt-10">
        Best Job Picks For You
      </h1>

      {jobs.length === 0 ? (
        <p className="text-gray-400 text-lg text-center">No jobs available right now.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 text-white h-full flex flex-col justify-between"
            >
              <div className="flex flex-col gap-4">
                <h2 className="text-3xl font-semibold">{job.orgName}</h2>
                <p className="text-base text-gray-300">Game: {job.game}</p>
                <p className="text-base text-gray-300">
                  Players Needed: {job.playersNeeded}
                </p>
                <p className="text-gray-300 whitespace-pre-wrap">
                  <strong>Perks:</strong> {job.perks || "None"}
                </p>
                <p className="text-gray-300 whitespace-pre-wrap">
                  <strong>Details:</strong> {job.orgDetails}
                </p>
              </div>

              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  className="text-white border-white border-opacity-50 hover:bg-white hover:text-indigo-700 transition-colors duration-200 w-full"
                  onClick={() => {
                    setApplyingJob(job);
                    setFormData({ profileName: "", whatsapp: "" });
                    setError(null);
                  }}
                >
                  Apply Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-xl max-w-md w-full p-8 relative border border-white/20 text-white">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setApplyingJob(null)}
              aria-label="Close apply form"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold mb-6">
              Apply for <span className="text-cyan-400">{applyingJob.orgName}</span>
            </h2>

            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Profile Name"
                value={formData.profileName}
                onChange={(e) =>
                  setFormData({ ...formData, profileName: e.target.value })
                }
                className="bg-white bg-opacity-10 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-300 text-white"
              />
              <input
                type="text"
                placeholder="WhatsApp Number"
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
                className="bg-white bg-opacity-10 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-300 text-white"
              />
              {error && <p className="text-red-500">{error}</p>}
              <Button
                onClick={handleApplySubmit}
                disabled={loading}
                className="bg-cyan-400 text-black hover:bg-cyan-300 font-semibold"
              >
                {loading ? "Applying..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

};

export default MyJobs;
