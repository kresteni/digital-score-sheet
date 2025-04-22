import React from "react";

const TournamentHistory = ({ onViewGameHistory }) => {
  const tournaments = [
    { id: "1", date: "2023-06-15", winner: "Team A", score: "15-12" },
    { id: "2", date: "2023-06-10", winner: "Team B", score: "13-11" },
    { id: "3", date: "2023-06-05", winner: "Team C", score: "14-13" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Tournament History</h2>
      <ul className="space-y-2">
        {tournaments.map((tournament) => (
          <li
            key={tournament.id}
            className="p-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
            onClick={() => onViewGameHistory(tournament)}
          >
            <p>Date: {tournament.date}</p>
            <p>Winner: {tournament.winner}</p>
            <p>Score: {tournament.score}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TournamentHistory;