import React from "react";
import {
  Menu,
  Home,
  History,
  Trophy,
  Settings as SettingsIcon,
  LogOut,
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

/**
 * @param {{
 *  title?: string,
 *  onNavigate?: (route: string) => void,
 *  userRole?: "head-marshall" | "marshall" | null,
 *  username?: string,
 *  onLogout?: () => void
 * }} props
 */
const Header = ({
  title = "Ultimate Scorekeeper",
  onNavigate = () => {},
  userRole = null,
  username = "",
  onLogout = () => {},
}) => {
  return (
    <header className="w-full h-20 bg-primary text-primary-foreground shadow-md flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-2">
        <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
        {userRole && (
          <span className="bg-primary-foreground/20 text-primary-foreground text-xs px-2 py-1 rounded-full">
            {userRole === "head-marshall" ? "Head Marshall" : "Marshall"}
          </span>
        )}
        {username && (
          <span className="bg-primary-foreground/10 text-primary-foreground text-xs px-2 py-1 rounded-full ml-2">
            {username}
          </span>
        )}
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                className="flex items-center px-4 py-2 text-sm font-medium hover:bg-primary-foreground/10 rounded-md cursor-pointer"
                onClick={() => onNavigate("/")}
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className="flex items-center px-4 py-2 text-sm font-medium hover:bg-primary-foreground/10 rounded-md cursor-pointer"
                onClick={() => onNavigate("/current-tournament")}
              >
                <Trophy className="mr-2 h-4 w-4" />
                Current Tournament
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className="flex items-center px-4 py-2 text-sm font-medium hover:bg-primary-foreground/10 rounded-md cursor-pointer"
                onClick={() => onNavigate("/history")}
              >
                <History className="mr-2 h-4 w-4" />
                History
              </NavigationMenuLink>
            </NavigationMenuItem>
            {username && (
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="flex items-center px-4 py-2 text-sm font-medium hover:bg-primary-foreground/10 rounded-md cursor-pointer"
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
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
            <DropdownMenuItem onClick={() => onNavigate("/")}>
              <Home className="mr-2 h-4 w-4" />
              Home
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate("/current-tournament")}>
              <Trophy className="mr-2 h-4 w-4" />
              Current Tournament
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate("/history")}>
              <History className="mr-2 h-4 w-4" />
              History
            </DropdownMenuItem>
            {username && (
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
