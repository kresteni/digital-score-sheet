/*import React, { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
//import Header from "./components/Header";
//import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Header
        title="Ultimate Scorekeeper"
        onNavigate={(route) => console.log(`Navigating to ${route}`)}
        userRole="head-marshall"
        username="JohnDoe"
        onLogout={() => console.log("Logging out")}
      />
    </Suspense>
  );
}

export default App;*/

 //src/App.jsx
 
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import Home from "./components/Home";

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        { /*Add more routes here if needed*/ }
     /* </Routes>
    </Suspense>
  );
}

export default App;

