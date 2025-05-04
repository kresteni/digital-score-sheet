import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { fetchMatchesFromFirestore, updateMatchStatus } from "../utils/bracketGeneration";

const PlayGame = ({ onStartGame, tournamentId }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        if (!tournamentId) {
          setGames([]);
          setLoading(false);
          return;
        }
        
        const matches = await fetchMatchesFromFirestore(tournamentId);
        setGames(matches);
      } catch (err) {
        console.error("Error fetching games:", err);
        setError("Failed to load games. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [tournamentId]);

  const handleStartGame = async (game) => {
    try {
      await updateMatchStatus(game.id, "In Progress");
      
      // Update the local state
      setGames(games.map(g => 
        g.id === game.id ? { ...g, status: "In Progress" } : g
      ));
      
      // Call the parent component's onStartGame function
      if (onStartGame) {
        onStartGame(game);
      }
    } catch (err) {
      console.error("Error starting game:", err);
      setError("Failed to start the game. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Loading games...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Games in Tournament</h2>
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-500">No games have been scheduled for this tournament yet.</p>
        </div>
      </div>
    );
  }

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
            <tr key={game.id} className={game.status === "In Progress" ? "bg-yellow-100" : game.status === "Completed" ? "bg-green-100" : ""}>
              <td className="border border-gray-300 p-2">{game.teamA?.name || "TBD"}</td>
              <td className="border border-gray-300 p-2">{game.teamB?.name || "TBD"}</td>
              <td className="border border-gray-300 p-2">
                {game.scoreA !== null && game.scoreB !== null 
                  ? `${game.scoreA}-${game.scoreB}` 
                  : "0-0"}
              </td>
              <td className="border border-gray-300 p-2">{game.pitch}</td>
              <td className="border border-gray-300 p-2">
                {new Date(game.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="border border-gray-300 p-2">{game.status}</td>
              <td className="border border-gray-300 p-2">{game.marshallName || "Unassigned"}</td>
              <td className="border border-gray-300 p-2">
                {game.status === "Scheduled" && (
                  <button
                    onClick={() => handleStartGame(game)}
                    className="p-2 bg-primary text-white rounded-lg"
                    disabled={!game.teamA || !game.teamB}
                  >
                    Start Game
                  </button>
                )}
                {game.status === "In Progress" && (
                  <button
                    onClick={() => onStartGame(game)}
                    className="p-2 bg-green-500 text-white rounded-lg"
                  >
                    Continue Game
                  </button>
                )}
                {game.status === "Completed" && (
                  <button
                    onClick={() => onStartGame(game)}
                    className="p-2 bg-gray-300 text-gray-700 rounded-lg"
                  >
                    View Details
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayGame;