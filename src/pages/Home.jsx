import MenuPage from "../components/MenuPage";
import { Toaster } from "sonner";
const Home = () => {
  return (
    <>
      <Toaster position="top-right" richColors />
      <MenuPage />
    </>
  );
};

export default Home;
