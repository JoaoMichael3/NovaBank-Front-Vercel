import MenuNavigation from "@/components/menuNavigation";
import MainLayout from "../layout";

const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex">
        <MenuNavigation />
        <h1 className="text-white">Olhe para atrás</h1>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
