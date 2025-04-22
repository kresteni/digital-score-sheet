import React from "react";

const PlayGame = ({ onStartGame }) => {
  const games = [
    {
      id: 1,
      teamA: "Team A",
      teamB: "Team B",
      score: "0-0",
      pitch: "Pitch 1",
      time: "10:00 AM",
      status: "Not Started",
      assignedMarshall: "John Doe",
    },
    {
      id: 2,
      teamA: "Team C",
      teamB: "Team D",
      score: "0-0",
      pitch: "Pitch 2",
      time: "11:00 AM",
      status: "Not Started",
      assignedMarshall: "Jane Smith",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Games in Tournament</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Team A</th>
            <th className="border border-gray-300 p-2">Team B</th>
            <th className="border border-gray-300 p-2">Score</th>
            <th className="border border-gray-300 p-2">Pitch</th>
            <th className="border border-gray-300 p-2">Time</th>
            <th className="border border-gray-300 p-2">Status</th>
            <th className="border border-gray-300 p-2">Assigned Marshall</th>
            <th className="border border-gray-300 p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id}>
              <td className="border border-gray-300 p-2">{game.teamA}</td>
              <td className="border border-gray-300 p-2">{game.teamB}</td>
              <td className="border border-gray-300 p-2">{game.score}</td>
              <td className="border border-gray-300 p-2">{game.pitch}</td>
              <td className="border border-gray-300 p-2">{game.time}</td>
              <td className="border border-gray-300 p-2">{game.status}</td>
              <td className="border border-gray-300 p-2">{game.assignedMarshall}</td>
              <td className="border border-gray-300 p-2">
                <button
                  onClick={() => onStartGame(game)}
                  className="p-2 bg-primary text-white rounded-lg"
                >
                  Start Game
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayGame;