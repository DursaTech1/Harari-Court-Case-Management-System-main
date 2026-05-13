import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../api/api";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear JWT + user data
    logoutUser();

    // Redirect to login / home page
    navigate("/");
  }, [navigate]);

  return null;
};

export default Logout;
