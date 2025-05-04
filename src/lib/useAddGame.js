import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const useAddGame = () => {
  const addGame = async (newGame) => {
    try {
      await addDoc(collection(db, "games"), newGame);
      console.log("Game added successfully!");
    } catch (error) {
      console.error("Error adding game: ", error);
    }
  };

  return addGame;
};

export default useAddGame;