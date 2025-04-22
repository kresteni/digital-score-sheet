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