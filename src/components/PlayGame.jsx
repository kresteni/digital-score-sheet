import React, { useState } from "react";
import useGames from "../lib/useGames";
import useAddGame from "../lib/useAddGame";

const PlayGame = ({ onStartGame }) => {
  const games = useGames();
  const addGame = useAddGame();

  const [newGame, setNewGame] = useState({
    teamA: "",
    teamB: "",
    score: "0-0",
    pitch: "",
    time: "",
    status: "Not Started",
    assignedMarshall: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGame((prevGame) => ({ ...prevGame, [name]: value }));
  };

  const handleAddGame = () => {
    addGame(newGame);
    setNewGame({
      teamA: "",
      teamB: "",
      score: "0-0",
      pitch: "",
      time: "",
      status: "Not Started",
      assignedMarshall: "",
    });
  };

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
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <h3 className="mt-4">Add New Game</h3>
        <input
          type="text"
          name="teamA"
          value={newGame.teamA}
          onChange={handleInputChange}
          placeholder="Team A"
          className="p-2 border"
        />
        <input
          type="text"
          name="teamB"
          value={newGame.teamB}
          onChange={handleInputChange}
          placeholder="Team B"
          className="p-2 border"
        />
        {/* Add other inputs like pitch, time, etc. */}
        <button onClick={handleAddGame} className="p-2 bg-primary text-white rounded-lg">
          Add Game
        </button>
      </div>
    </div>
  );
};

export default PlayGame;