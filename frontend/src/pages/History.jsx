import React from 'react';
import { PageHeader, Card } from '../components/UI';
import { useAutomaton } from '../context/AutomatonContext';

export default function History() {
  const { history } = useAutomaton();

  return (
    <div className="p-8 flex flex-col gap-6">
      <PageHeader title="Project History" subtitle="View all actions performed in this session" icon="📜" />
      <Card>
        {history && history.length > 0 ? (
          <ul className="space-y-4">
            {history.map((item, index) => (
              <li key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-800">{item.action}</span>
                <span className="text-sm text-gray-500">{new Date(item.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-8">No history available yet.</p>
        )}
      </Card>
    </div>
  );
}
