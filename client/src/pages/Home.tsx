import React from "react";
import NavBar from "@/components/NavBar";
import MapView from "@/components/MapView";
import SidePanel from "@/components/SidePanel";
import Footer from "@/components/Footer";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <NavBar />
      <main className="flex flex-col md:flex-row flex-grow overflow-hidden">
        <SidePanel />
        <MapView />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
