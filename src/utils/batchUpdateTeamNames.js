// Batch update script to set teamAName and teamBName in all matches
// Usage: node src/utils/batchUpdateTeamNames.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');
const firebaseConfig = require('../firebase-config.json'); // You may need to adjust this path

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function batchUpdateTeamNames() {
  try {
    // Fetch all teams
    const teamsSnapshot = await getDocs(collection(db, 'teams'));
    const teams = {};
    teamsSnapshot.forEach(teamDoc => {
      const data = teamDoc.data();
      teams[teamDoc.id] = data.name;
    });

    // Fetch all matches
    const matchesSnapshot = await getDocs(collection(db, 'matches'));
    let updatedCount = 0;
    for (const matchDoc of matchesSnapshot.docs) {
      const match = matchDoc.data();
      const teamAName = teams[match.teamAId] || 'Team A';
      const teamBName = teams[match.teamBId] || 'Team B';
      // Only update if names are missing or incorrect
      if (match.teamAName !== teamAName || match.teamBName !== teamBName) {
        await updateDoc(doc(db, 'matches', matchDoc.id), {
          teamAName,
          teamBName,
        });
        updatedCount++;
        console.log(`Updated match ${matchDoc.id}: ${teamAName} vs ${teamBName}`);
      }
    }
    console.log(`Batch update complete. Updated ${updatedCount} matches.`);
  } catch (error) {
    console.error('Error updating matches:', error);
  }
}

batchUpdateTeamNames(); 