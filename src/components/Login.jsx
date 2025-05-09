import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LogIn, ArrowLeft } from "lucide-react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState(location.state?.role || localStorage.getItem('selectedRole') || "marshall");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (location.state?.role) {
      setUserRole(location.state.role);
      localStorage.setItem('selectedRole', location.state.role);
    }
  }, [location.state]);

  useEffect(() => {
    // If already logged in, redirect to initial menu
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      setIsLoading(false);
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

        // Role validation
        if (userData.role !== userRole) {
          await auth.signOut();
          setError("Role mismatch. Please log in using the correct role.");
          setIsLoading(false);
          return;
        }

        // Store user data in localStorage for persistence
        localStorage.setItem('userData', JSON.stringify({
          uid: user.uid,
          email: user.email,
          role: userData.role,
          displayName: userData.name || user.email
        }));

        // Navigate to initial menu
        navigate("/");
      } else {
        setError("No user data found. Please contact support.");
        await auth.signOut();
      }
    } catch (err) {
      console.error("Login error:", err);
      let errorMessage = "An error occurred during login.";
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email format.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
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
                disabled={isLoading}
                required
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
                disabled={isLoading}
                required
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
                disabled={isLoading}
              >
                <ArrowLeft size={16} />
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex items-center gap-2 flex-1"
                disabled={isLoading}
              >
                <LogIn size={16} />
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div className="flex justify-center items-center gap-2 mt-4">
              <span>Don't have an account?</span>
              <button
                onClick={() => navigate("/signup")}
                className="text-primary hover:underline font-medium"
                type="button"
                disabled={isLoading}
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