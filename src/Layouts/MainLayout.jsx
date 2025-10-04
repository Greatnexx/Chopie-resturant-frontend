import { Outlet } from "react-router-dom";

import Header from "../components/Header"; // Assuming you have a Header component

const MainLayout = () => {
  
  
 

  return (
    <>
     <Header/>
        <Outlet />
      
    </>
  );
};

export default MainLayout;
