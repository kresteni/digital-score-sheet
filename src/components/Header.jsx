import React, { useState } from "react";
import { Button } from "./ui/button";
import { LogOut, Menu, X, User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const HeaderJS = ({
  title = "Ultimate Scorekeeper",
  onNavigate = () => {},
  userRole = null,
  username = "",
  onLogout = () => {},
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">{title}</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {userRole && (
            <>
              <Button
                variant="ghost"
                className="text-white hover:text-white hover:bg-primary-foreground/20"
                onClick={() => onNavigate("/")}
              >
                Home
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:text-white hover:bg-primary-foreground/20"
                onClick={() => onNavigate("/history")}
              >
                Game History
              </Button>
              {userRole === "head-marshall" && (
                <Button
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-primary-foreground/20"
                  onClick={() => onNavigate("/marshall-assignments")}
                >
                  Marshall Assignments
                </Button>
              )}
              <Button
                variant="ghost"
                className="text-white hover:text-white hover:bg-primary-foreground/20"
                onClick={() => onNavigate("/settings")}
              >
                Settings
              </Button>
            </>
          )}
        </nav>

        {/* User Menu */}
        {userRole ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-white hover:text-white hover:bg-primary-foreground/20 flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                {username}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onNavigate("/settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-primary-foreground/20"
            onClick={() => onNavigate("/login")}
          >
            Login
          </Button>
        )}

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          className="md:hidden text-white hover:text-white hover:bg-primary-foreground/20"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-primary-foreground/10 p-4">
          <div className="flex flex-col space-y-2">
            {userRole ? (
              <>
                <Button
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-primary-foreground/20 justify-start"
                  onClick={() => {
                    onNavigate("/");
                    toggleMobileMenu();
                  }}
                >
                  Home
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-primary-foreground/20 justify-start"
                  onClick={() => {
                    onNavigate("/history");
                    toggleMobileMenu();
                  }}
                >
                  Game History
                </Button>
                {userRole === "head-marshall" && (
                  <Button
                    variant="ghost"
                    className="text-white hover:text-white hover:bg-primary-foreground/20 justify-start"
                    onClick={() => {
                      onNavigate("/marshall-assignments");
                      toggleMobileMenu();
                    }}
                  >
                    Marshall Assignments
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-primary-foreground/20 justify-start"
                  onClick={() => {
                    onNavigate("/settings");
                    toggleMobileMenu();
                  }}
                >
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-primary-foreground/20 justify-start"
                  onClick={() => {
                    onLogout();
                    toggleMobileMenu();
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                className="text-white hover:text-white hover:bg-primary-foreground/20 justify-start"
                onClick={() => {
                  onNavigate("/login");
                  toggleMobileMenu();
                }}
              >
                Login
              </Button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default HeaderJS;
