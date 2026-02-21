import React, { useEffect, useState } from 'react';
import { jobHistoryStorage, seenJobIdsStorage } from '../utils/storage';

import type { Job } from '../utils/types';

export function JobHistoryTab() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobHistoryStorage.getValue().then((j) => {
      setJobs(j);
      setLoading(false);
    });
  }, []);

  async function handleClear() {
    await Promise.all([
      jobHistoryStorage.setValue([]),
      seenJobIdsStorage.setValue([]),
    ]);
    setJobs([]);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ margin: 0, color: '#555', fontSize: 13 }}>
          {jobs.length === 0 ? 'No jobs scraped yet.' : `${jobs.length} job${jobs.length !== 1 ? 's' : ''} in history`}
        </p>
        {jobs.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: '5px 12px', background: 'none', color: '#c70e05',
              border: '1px solid #c70e05', borderRadius: 4, cursor: 'pointer', fontSize: 12,
            }}
          >
            Clear history
          </button>
        )}
      </div>

      {jobs.map((job) => (
        <div
          key={job.uid}
          style={{
            border: '1px solid #e0e0e0', borderRadius: 6, padding: 16,
            marginBottom: 12, background: '#fff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <a
              href={job.url}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#14a800', fontWeight: 600, fontSize: 15, textDecoration: 'none', lineHeight: 1.3 }}
            >
              {job.title}
            </a>
            <span style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>{job.datePosted}</span>
          </div>

          <div style={{ marginTop: 6, display: 'flex', gap: 16, fontSize: 12, color: '#555' }}>
            {job.jobType && <span>{job.jobType}</span>}
            {job.budget && <span style={{ fontWeight: 500 }}>{job.budget}</span>}
            {job.experienceLevel && <span>{job.experienceLevel}</span>}
          </div>

          {job.description && (
            <p style={{ margin: '8px 0 0', fontSize: 13, color: '#333', lineHeight: 1.5 }}>
              {job.description.length > 200 ? job.description.slice(0, 200) + '…' : job.description}
            </p>
          )}

          {job.skills.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    padding: '2px 8px', background: '#f0f0f0', borderRadius: 12,
                    fontSize: 11, color: '#444',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          <div style={{ marginTop: 8, fontSize: 11, color: '#888', display: 'flex', gap: 12 }}>
            {job.paymentVerified && <span>✓ Payment verified</span>}
            {job.clientRating && <span>⭐ {job.clientRating}</span>}
            {job.clientTotalSpent && <span>{job.clientTotalSpent} spent</span>}
            {job.proposals && <span>{job.proposals} proposals</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
