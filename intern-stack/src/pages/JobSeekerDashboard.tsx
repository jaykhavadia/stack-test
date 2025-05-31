import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store';
import { useApi } from '../hooks/useApi';
import { Job, Application } from '../types';

const applicationData = [
  { week: 'Week 1', applications: 3 },
  { week: 'Week 2', applications: 5 },
  { week: 'Week 3', applications: 2 },
  { week: 'Week 4', applications: 7 },
  { week: 'Week 5', applications: 4 },
  { week: 'Week 6', applications: 6 },
];

function JobSeekerDashboard() {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const currentUser = useStore((state) => state.currentUser);
  const token = currentUser?.token || '';

  const { callApi } = useApi();

  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) {
        setApplications([] as Application[]);
        setJobs([] as Job[]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      // Fetch applications for current user
      const { data: applicationsData, error: applicationsError } = await callApi('/api/applications', {
        token,
      });

      // Fetch all jobs
      const { data: jobsData, error: jobsError } = await callApi('/api/jobs');

      if (applicationsError) {
        setError(applicationsError);
      } else if (jobsError) {
        setError(jobsError);
      } else {
        setApplications(Array.isArray(applicationsData) ? applicationsData : []);
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      }
      setLoading(false);
    }

    fetchData();
  }, [currentUser, token]);

  const userApplications = applications.filter((app) => app.user._id === currentUser?.id);

  if (loading) {
    return <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading...</div>;
  }

  if (error) {
    return <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Error: {error}</div>;
  }

  return (
    <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Job Seeker Dashboard</h1>
        <p className="text-gray-500">Welcome back, {currentUser?.name}</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
          <h3 className="text-lg font-semibold mb-2">Total Applications</h3>
          <p className="text-3xl font-bold text-blue-600">{userApplications.length}</p>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
          <h3 className="text-lg font-semibold mb-2">Under Review</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {userApplications.filter((app) => app.status === 'pending').length}
          </p>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
          <h3 className="text-lg font-semibold mb-2">Accepted</h3>
          <p className="text-3xl font-bold text-green-600">
            {userApplications.filter((app) => app.status === 'accepted').length}
          </p>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
          <h3 className="text-lg font-semibold mb-2">Rejected</h3>
          <p className="text-3xl font-bold text-red-600">
            {userApplications.filter((app) => app.status === 'rejected').length}
          </p>
        </div>
      </div>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md mb-8`}>
        <h2 className="text-xl font-bold mb-4">Application Activity</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={applicationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
        <h2 className="text-xl font-bold p-6 border-b border-gray-200">Application History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className="px-6 py-3 text-left">Job Title</th>
                <th className="px-6 py-3 text-left">Company</th>
                <th className="px-6 py-3 text-left">Applied Date</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {userApplications.map((app) => {
                const job = jobs.find((j) => j.id === app.jobId);
                return (
                  <tr key={app.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4">{job?.title}</td>
                    <td className="px-6 py-4">{job?.company}</td>
                    <td className="px-6 py-4">{app.appliedDate}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          app.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : app.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default JobSeekerDashboard;
