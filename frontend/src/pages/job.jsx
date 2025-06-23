import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, X } from "lucide-react";

const JobPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({
    orgName: "",
    ownerName: "",
    phone: "",
    game: "",
    playersNeeded: "",
    perks: "",
    orgDetails: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  const [applicantsMap, setApplicantsMap] = useState({});
  const [showingApplicantsFor, setShowingApplicantsFor] = useState(null);
  const [applicantError, setApplicantError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not authenticated.");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8080/api/jobs/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(errMsg || "Failed to fetch jobs");
        }

        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleEditClick = (job) => {
    setEditingJob(job);
    setEditForm({
      orgName: job.orgName || "",
      ownerName: job.ownerName || "",
      phone: job.phone || "",
      game: job.game || "",
      playersNeeded: job.playersNeeded || "",
      perks: job.perks || "",
      orgDetails: job.orgDetails || "",
    });
    setEditError(null);
  };

  const handleEditChange = (field) => (e) => {
    setEditForm({ ...editForm, [field]: e.target.value });
  };

  const handleEditSubmit = async () => {
    setEditLoading(true);
    setEditError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated.");

      const response = await fetch(
        `http://localhost:8080/api/jobs/${editingJob.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const errMsg = contentType?.includes("application/json")
          ? (await response.json())?.message
          : await response.text();
        throw new Error(errMsg || "Failed to update job");
      }

      const updatedJob = contentType?.includes("application/json")
        ? await response.json()
        : { ...editingJob, ...editForm };

      setJobs((prev) =>
        prev.map((job) => (job.id === updatedJob.id ? updatedJob : job))
      );

      setEditingJob(null);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job post?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated.");

      const response = await fetch(`http://localhost:8080/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || "Failed to delete job post.");
      }

      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleShowApplicants = async (jobId) => {
    if (showingApplicantsFor === jobId) {
      setShowingApplicantsFor(null);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return setApplicantError("User not authenticated.");

    try {
      setShowingApplicantsFor(jobId);
      setApplicantError(null);

      if (applicantsMap[jobId]) return;

      const response = await fetch(
        `http://localhost:8080/api/jobs/jobs/${jobId}/applicants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || "Failed to fetch applicants.");
      }

      const data = await response.json();
      setApplicantsMap((prev) => ({ ...prev, [jobId]: data }));
    } catch (err) {
      setApplicantError(err.message);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-gray-400 flex justify-center items-center min-h-screen">
        Loading your job posts...
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-red-500 font-semibold flex justify-center items-center min-h-screen">
        Error: {error}
      </div>
    );

  if (jobs.length === 0)
    return (
      <div className="p-6 text-gray-400 flex justify-center items-center min-h-screen">
        No job posts found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-white drop-shadow-lg">
          Your Job Posts
        </h1>
        <div className="space-y-10">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row md:justify-between md:items-start hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-10 flex-1 text-white">
                <div className="flex flex-col space-y-2 min-w-[220px]">
                  <h2 className="text-3xl font-semibold">{job.orgName}</h2>
                  <p className="text-base text-gray-300">Owner: {job.ownerName}</p>
                  <p className="text-base text-gray-300">Phone: {job.phone}</p>
                </div>

                <div className="flex flex-col space-y-2 min-w-[200px]">
                  <p className="font-semibold text-xl">{job.game}</p>
                  <p className="text-gray-300 text-base">
                    Players Needed: {job.playersNeeded}
                  </p>
                </div>

                <div className="flex flex-col space-y-3 flex-1 max-w-3xl">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    <strong>Perks: </strong> {job.perks || "None"}
                  </p>
                  <p className="text-gray-300 whitespace-pre-wrap">
                    <strong>Details: </strong> {job.orgDetails}
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center w-full md:w-auto md:text-right flex flex-col items-center gap-4">
                <p className="text-gray-400 text-sm whitespace-nowrap">
                  Posted At: {new Date(job.postedAt).toLocaleString()}
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    variant="outline"
                    className="text-white border-white border-opacity-50 hover:bg-white hover:text-indigo-700 transition-colors duration-200 flex items-center"
                    onClick={() => handleEditClick(job)}
                    aria-label="Edit job"
                  >
                    <Edit className="w-5 h-5 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex items-center"
                    onClick={() => handleDelete(job.id)}
                    aria-label="Delete job"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    className="text-white border-white border-opacity-50 hover:bg-white hover:text-indigo-700 transition-colors duration-200"
                    onClick={() => handleShowApplicants(job.id)}
                    aria-label="Show Applicants"
                  >
                    👥 {showingApplicantsFor === job.id ? "Hide Applicants" : "Show Applicants"}
                  </Button>
                </div>

                {applicantError && (
                  <p className="text-red-400 mt-2 font-semibold">
                    Error: {applicantError}
                  </p>
                )}
                {showingApplicantsFor === job.id && (
                  <div className="mt-4 bg-white bg-opacity-10 p-4 rounded-xl w-full text-left">
                    <h3 className="text-white font-bold text-lg mb-2">
                      Applicants
                    </h3>
                    {applicantsMap[job.id]?.length === 0 ? (
                      <p className="text-gray-300">No applicants yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {applicantsMap[job.id]?.map((app, index) => (
                          <li key={index} className="text-gray-200">
                            🔹 {app.profileName} ({app.whatsappNumber})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center px-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-4xl w-full relative text-white shadow-xl">
            <button
              onClick={() => setEditingJob(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-600"
              aria-label="Close edit form"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-bold mb-6">Edit Job Post</h2>

            {editError && (
              <p className="text-red-500 mb-4 font-medium">Error: {editError}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Organization Name", field: "orgName" },
                { label: "Owner Name", field: "ownerName" },
                { label: "Phone", field: "phone" },
                { label: "Game", field: "game" },
                { label: "Players Needed", field: "playersNeeded" },
                { label: "Perks", field: "perks" },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  <input
                    type="text"
                    value={editForm[field]}
                    onChange={handleEditChange(field)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}

              {/* Full width textarea for Organization Details */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Organization Details
                </label>
                <textarea
                  rows={4}
                  value={editForm.orgDetails}
                  onChange={handleEditChange("orgDetails")}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setEditingJob(null)}
                className="border-gray-400 text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSubmit}
                disabled={editLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPage;
