import DashboardLayout from "./DashboardLayout";
import role from "../constants/role";

export default ({ children }) => (
  <DashboardLayout
    allowedRole={[role.ADMIN, role.CUSTOMER]}
    children={children}
  />
);
