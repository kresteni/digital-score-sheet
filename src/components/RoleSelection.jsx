import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Shield, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    localStorage.setItem('userRole', role);
    navigate('/login', { state: { role } });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-background">
      <Card className="w-full shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Select Your Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {/* Head Marshall Button */}
            <Button
              onClick={() => handleRoleSelect("head-marshall")}
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl bg-primary hover:bg-primary/90 transition-all"
            >
              <ShieldCheck size={48} />
              <span>Head Marshall</span>
            </Button>

            {/* Marshall Button */}
            <Button
              onClick={() => handleRoleSelect("marshall")}
              variant="secondary"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl bg-secondary hover:bg-secondary/90 transition-all"
            >
              <Shield size={48} />
              <span>Marshall</span>
            </Button>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              <strong>Head Marshall:</strong> Full access to all game management
              features
            </p>
            <p className="mt-2">
              <strong>Marshall:</strong> Limited access to assist with game
              tracking
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSelection;