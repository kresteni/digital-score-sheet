import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LogIn, ArrowLeft } from "lucide-react";

const Login = ({ userRole, onLogin, onBack }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }
    setError("");
    onLogin(username, password);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-background">
      <Card className="w-full shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">
            Login as{" "}
            {userRole === "head-marshall" ? "Head Marshall" : "Marshall"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 font-medium">{error}</div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={onBack}
              >
                <ArrowLeft size={16} />
                Back
              </Button>
              <Button type="submit" className="flex items-center gap-2 flex-1">
                <LogIn size={16} />
                Login
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Enter your credentials to access the scorekeeper app</p>
            <p className="mt-2">
              {userRole === "head-marshall"
                ? "Head Marshall accounts have full administrative access"
                : "Marshall accounts have limited permissions"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
