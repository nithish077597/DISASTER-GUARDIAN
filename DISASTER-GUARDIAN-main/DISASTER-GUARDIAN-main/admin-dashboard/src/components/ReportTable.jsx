import React from 'react';

function ReportTable({ reports, onOverrideStatus, onOverrideSeverity }) {
  if (!reports.length) return <p>No reports yet.</p>;
  return (
    <div>
      <h2>Live Reports</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Lat</th>
            <th>Lng</th>
            <th>Severity</th>
            <th>Confidence</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.disaster_type}</td>
              <td>{r.lat}</td>
              <td>{r.lng}</td>
              <td>{r.severity}</td>
              <td>{r.confidence_score}</td>
              <td>{r.status}</td>
              <td>
                <button onClick={() => onOverrideStatus(r.id, 'CONFIRMED')}>Confirm</button>
                <button onClick={() => onOverrideStatus(r.id, 'FALSE_REPORT')}>False</button>
                <select onChange={(e) => onOverrideSeverity(r.id, e.target.value)} defaultValue="">
                  <option value="" disabled>Severity</option>
                  <option>LOW_CONFIDENCE</option>
                  <option>CONFIRMED</option>
                  <option>HIGH_RISK</option>
                  <option>CRITICAL</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReportTable;
