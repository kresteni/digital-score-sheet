import React, { useState, useEffect } from "react";
import GameSetup from "./GameSetup";
import GameScreen from "./GameScreen";
import GameSummary from "./GameSummary";
import GameHistory from "./GameHistory";
import RoleSelection from "./RoleSelection";
import Login from "./Login";
import SignUp from "./SignUp";
import TournamentSetup from "./TournamentSetup";
import TeamManagement from "./TeamManagement";
import BracketManagement from "./BracketManagement";
import AwardsCalculation from "./AwardsCalculation";
import MarshallAssignments from "./MarshallAssignments";
import InitialMenu from "./InitialMenu";
import TournamentMenu from "./TournamentMenu";
import TournamentHistoryList from "./TournamentHistoryList";
import TournamentGames from "./TournamentGames";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { useNavigate, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const { currentUser } = useAuth();
  if (currentUser) {
    return <Navigate to="/initial-menu" replace />;
  }
  return <Navigate to="/role-selection" replace />;
};

export default Home;