import React, { useState } from 'react';
import { PageHeader, Card, PrimaryButton } from '../components/UI';

export default function Challenge() {
  const [activeChallenge, setActiveChallenge] = useState(null);

  const challenges = [
    {
      id: 1,
      title: "Convert NFA to DFA",
      description: "You'll be given an NFA and must construct the correct DFA visually."
    },
    {
      id: 2,
      title: "Identify Unreachable States",
      description: "Click on the states that cannot be reached from the start state."
    },
    {
      id: 3,
      title: "Minimize DFA",
      description: "Step through the partition refinement algorithm manually."
    },
    {
      id: 4,
      title: "String Acceptance",
      description: "Trace a string's path and determine if it's accepted or rejected."
    },
    {
      id: 5,
      title: "Find a Counterexample",
      description: "Given two non-equivalent DFAs, find a string that one accepts and the other rejects."
    }
  ];

  return (
    <div className="p-8 flex flex-col gap-6">
      <PageHeader title="Challenge Mode" subtitle="Test your knowledge of Finite Automata!" icon="🏆" />

      {!activeChallenge ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="flex flex-col h-full hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{challenge.id}. {challenge.title}</h3>
                <p className="text-gray-600">{challenge.description}</p>
              </div>
              <div className="mt-6">
                <PrimaryButton onClick={() => setActiveChallenge(challenge.id)} className="w-full">
                  Start Challenge
                </PrimaryButton>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="min-h-[400px] flex flex-col items-center justify-center text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Interactive Challenge System</h2>
          <p className="text-gray-500 mb-6">This challenge is coming in a future update.</p>
          <PrimaryButton onClick={() => setActiveChallenge(null)}>
            Back to Challenges
          </PrimaryButton>
        </Card>
      )}
    </div>
  );
}
