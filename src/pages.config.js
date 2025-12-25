import Assignments from './pages/Assignments';
import Communications from './pages/Communications';
import CustomerDetail from './pages/CustomerDetail';
import CustomerPortal from './pages/CustomerPortal';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import Services from './pages/Services';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Assignments": Assignments,
    "Communications": Communications,
    "CustomerDetail": CustomerDetail,
    "CustomerPortal": CustomerPortal,
    "Customers": Customers,
    "Dashboard": Dashboard,
    "Groups": Groups,
    "Services": Services,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};