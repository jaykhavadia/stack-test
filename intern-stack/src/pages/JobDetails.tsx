import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Building2, Clock, Send } from 'lucide-react';
import { useStore } from '../store';
import type { Job, User } from '../types';
import { useApi } from '../hooks/useApi';

function JobDetails() {
  const { id } = useParams();
  const isDarkMode = useStore((state: { isDarkMode: boolean }) => state.isDarkMode);
  const currentUser = useStore((state: { currentUser: User | null }) => state.currentUser);
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string>('');
  const [applying, setApplying] = useState<boolean>(false);
  const { callApi } = useApi();

  useEffect(() => {
    const fetchJob = async () => {
      const { data, error } = await callApi<Job>(`/api/jobs/${id}`);
      if (error) {
        setError('Job not found');
      } else {
        setJob(data);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async (): Promise<void> => {
    if (!currentUser || currentUser.role !== 'jobseeker') {
      alert('Only job seekers can apply for jobs.');
      return;
    }
    setApplying(true);
    const { error } = await callApi('/api/applications', {
      method: 'POST',
      body: { jobId: id },
      token: currentUser.token,
    });
    if (error) {
      alert(error || 'Failed to apply for job');
    } else {
      alert('Application submitted successfully');
    }
    setApplying(false);
  };

  if (error) {
    return <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{error}</div>;
  }

  if (!job) {
    return <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading...</div>;
  }

  return (
    <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 mb-8`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
            <div className="flex items-center text-gray-500 mb-4">
              <Building2 className="w-5 h-5 mr-2" />
              <span className="mr-4">{job.company}</span>
              <MapPin className="w-5 h-5 mr-2" />
              <span>{job.location}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`px-4 py-2 rounded-full text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {job.type}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {job.category}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 mb-2">{job.salary}</div>
            <div className="flex items-center text-gray-500">
              <Clock className="w-5 h-5 mr-2" />
              <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {currentUser?.role === 'jobseeker' && (
          <button
            onClick={handleApply}
            disabled={applying}
            className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
          >
            <Send className="w-5 h-5 mr-2" />
            {applying ? 'Applying...' : 'Apply Now'}
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 mb-8`}>
            <h2 className="text-2xl font-bold mb-4">Job Description</h2>
            <p className="mb-6 whitespace-pre-line">{job.description}</p>

            <h3 className="text-xl font-bold mb-4">Requirements</h3>
            <ul className="list-disc pl-6 space-y-2">
              {job.requirements.map((req: string, index: number) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8`}>
            <h2 className="text-xl font-bold mb-4">Company Overview</h2>
            <div className="flex items-center mb-4">
              <Building2 className="w-12 h-12 text-blue-600 mr-4" />
              <div>
                <h3 className="font-semibold">{job.company}</h3>
                <p className="text-gray-500">{job.location}</p>
              </div>
            </div>
            <p className="text-gray-500">
              Leading technology company specializing in innovative solutions...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;
