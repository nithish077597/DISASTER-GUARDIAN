import React from 'react';

function AlertPanel({ alerts }) {
  if (!alerts.length) return <p>No alerts sent yet.</p>;
  return (
    <div>
      <h2>Alert Log</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Report</th>
            <th>Severity</th>
            <th>Channels</th>
            <th>Sent At</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map(a => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.report_id}</td>
              <td>{a.severity}</td>
              <td>{a.channels}</td>
              <td>{new Date(a.sent_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AlertPanel;
