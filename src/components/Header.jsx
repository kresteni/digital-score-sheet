import React from "react";
import {
  Menu,
  Home,
  History,
  Trophy,
  Settings as SettingsIcon,
  LogOut,
  LogIn,
  Disc3,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "./ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Handler for Current Tournament
  const handleCurrentTournament = async () => {
    try {
      // Query for active tournaments using both isFinished: false and status: 'active'
      const tournamentsRef = collection(db, "tournaments");
      const q1 = query(tournamentsRef, where("isFinished", "==", false));
      const q2 = query(tournamentsRef, where("status", "==", "active"));
      const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

      // Merge results, avoiding duplicates
      const tournamentsMap = new Map();
      snapshot1.forEach(doc => tournamentsMap.set(doc.id, doc.data()));
      snapshot2.forEach(doc => tournamentsMap.set(doc.id, doc.data()));
      const tournaments = Array.from(tournamentsMap.entries()).map(([id, data]) => ({ id, ...data }));

      console.log("Found tournaments:", tournaments);

      // Filter for actually active tournaments
      const activeTournaments = tournaments.filter(
        t => t.isFinished === false || t.status === "active"
      );

      // Sort by createdAt or startDate (descending)
      activeTournaments.sort((a, b) => {
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.startDate || 0);
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.startDate || 0);
        return bDate - aDate;
      });

      if (activeTournaments.length === 0) {
        alert("No active tournament found.");
      } else {
        // Both roles go to menu
        const tournament = activeTournaments[0];
        console.log("Navigating to tournament:", tournament.id, tournament);
        navigate(`/tournament/${tournament.id}/menu`);
      }
    } catch (error) {
      console.error("Error checking current tournament:", error);
      alert("Error checking current tournament.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/role-selection");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const renderNavigation = () => {
    if (!currentUser) {
      return (
        <NavigationMenuItem>
          <NavigationMenuLink
            className="flex items-center px-4 py-2 text-sm font-medium hover:bg-primary-foreground/10 rounded-md cursor-pointer"
            onClick={() => handleNavigation("/login")}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </NavigationMenuLink>
        </NavigationMenuItem>
      );
    }

    return (
      <>
        <NavigationMenuItem>
          <NavigationMenuLink
            className="flex items-center px-4 py-2 text-sm font-medium hover:bg-primary-foreground/10 rounded-md cursor-pointer"
            onClick={() => handleNavigation("/home")}
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* Current Tournament for both roles */}
        {(currentUser.role === 'head-marshall' || currentUser.role === 'marshall') && (
        <NavigationMenuItem>
          <NavigationMenuLink
            className="flex items-center px-4 py-2 text-sm font-medium hover:bg-primary-foreground/10 rounded-md cursor-pointer"
              onClick={handleCurrentTournament}
          >
              <Disc3 className="mr-2 h-4 w-4" />
            Current Tournament
          </NavigationMenuLink>
        </NavigationMenuItem>
        )}
        <NavigationMenuItem>
          <NavigationMenuLink
            className="flex items-center px-4 py-2 text-sm font-medium hover:bg-primary-foreground/10 rounded-md cursor-pointer"
            onClick={() => handleNavigation("/tournament-history")}
          >
            <History className="mr-2 h-4 w-4" />
            Tournament History
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className="flex items-center px-4 py-2 text-sm font-medium hover:bg-primary-foreground/10 rounded-md cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </NavigationMenuLink>
        </NavigationMenuItem>
      </>
    );
  };

  const renderMobileNavigation = () => {
    if (!currentUser) {
      return (
        <DropdownMenuItem onClick={() => handleNavigation("/login")}>
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </DropdownMenuItem>
      );
    }

    return (
      <>
        <DropdownMenuItem onClick={() => handleNavigation("/home")}>
          <Home className="mr-2 h-4 w-4" />
          Home
        </DropdownMenuItem>
        {/* Current Tournament for both roles */}
        {(currentUser.role === 'head-marshall' || currentUser.role === 'marshall') && (
          <DropdownMenuItem onClick={handleCurrentTournament}>
            <Disc3 className="mr-2 h-4 w-4" />
          Current Tournament
        </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleNavigation("/tournament-history")}>
          <History className="mr-2 h-4 w-4" />
          Tournament History
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </>
    );
  };

  return (
    <header className="w-full h-20 bg-primary text-primary-foreground shadow-md flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-2">
        <h1 className="text-xl md:text-2xl font-bold">Ultimate Scorekeeper</h1>
        {currentUser && (
          <>
          <span className="bg-primary-foreground/20 text-primary-foreground text-xs px-2 py-1 rounded-full">
              {currentUser.role === "head-marshall" ? "Head Marshall" : "Marshall"}
          </span>
          <span className="bg-primary-foreground/10 text-primary-foreground text-xs px-2 py-1 rounded-full ml-2">
              {currentUser.displayName || currentUser.email}
          </span>
          </>
        )}
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <NavigationMenu>
          <NavigationMenuList>
            {renderNavigation()}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {renderMobileNavigation()}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;