import React from "react";
import {
  Menu,
  Home,
  History,
  Trophy,
  Settings as SettingsIcon,
  LogOut,
  LogIn,
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

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
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
        {currentUser.role === 'head-marshall' && (
          <NavigationMenuItem>
            <NavigationMenuLink
              className="flex items-center px-4 py-2 text-sm font-medium hover:bg-primary-foreground/10 rounded-md cursor-pointer"
              onClick={() => handleNavigation("/tournament/new/setup")}
            >
              <Trophy className="mr-2 h-4 w-4" />
              New Tournament
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
        {currentUser.role === 'head-marshall' && (
          <DropdownMenuItem onClick={() => handleNavigation("/tournament/new/setup")}>
            <Trophy className="mr-2 h-4 w-4" />
            New Tournament
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