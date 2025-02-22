import React from "react";
import { Link } from "react-router-dom";
import "../Colors.css";


const Home = () => {
  return (
    <div className="container">
      <div className="card w-[400px] text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to <span className="text-primary">StegoMedia</span></h1>
        <div className="flex flex-col gap-4">
          <Link to="/encrypt" className="button w-full">Get started</Link>
          {/* <Link to="/decrypt" className="button w-full">Decrypt Message</Link> */}
        </div>
      </div>
    </div>
  );
};

export default Home;
