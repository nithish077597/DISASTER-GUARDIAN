import React from 'react';

function ReportList({ reports }) {
  if (!reports.length) return <p>No reports yet.</p>;
  return (
    <div className="report-list">
      <h2>Recent Reports</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Severity</th>
            <th>Confidence</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.disaster_type}</td>
              <td>{r.severity}</td>
              <td>{r.confidence_score}</td>
              <td>{r.status}</td>
              <td>{new Date(r.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReportList;
