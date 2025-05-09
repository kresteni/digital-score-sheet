import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LogIn, ArrowLeft } from "lucide-react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = ({ userRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    try {
      // Firebase Auth login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Retrieve role and username from Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        // Optional: role validation
        if (userData.role !== userRole) {
          setError("Role mismatch. Please log in using the correct role.");
          return;
        }

        // All good, login success
        navigate("/");
      } else {
        setError("No user data found. Please contact support.");
      }
    } catch (err) {
      console.error("Login error:", err.message);
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-background">
      <Card className="w-full shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">
            Login as {userRole === "head-marshall" ? "Head Marshall" : "Marshall"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                onClick={() => navigate("/role-selection")}
              >
                <ArrowLeft size={16} />
                Back
              </Button>
              <Button type="submit" className="flex items-center gap-2 flex-1">
                <LogIn size={16} />
                Login
              </Button>
            </div>
            <div className="flex justify-center items-center gap-2 mt-4">
              <span>Don't have an account?</span>
              <button
                onClick={() => navigate("/signup")}
                className="text-primary hover:underline font-medium"
                type="button"
              >
                Create Account
              </button>
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