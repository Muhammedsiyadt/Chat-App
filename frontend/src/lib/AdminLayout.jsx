import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const AdminLayout = ({ children }) => {
  const { authAdmin, initializeAdminAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      await initializeAdminAuth();
    };

    verifyAdmin();
  }, [initializeAdminAuth]);

  if (!authAdmin) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return children;
};

export default AdminLayout;