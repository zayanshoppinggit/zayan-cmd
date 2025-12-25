import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Services from './pages/Services';
import Assignments from './pages/Assignments';
import Groups from './pages/Groups';
import Communications from './pages/Communications';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Customers": Customers,
    "CustomerDetail": CustomerDetail,
    "Services": Services,
    "Assignments": Assignments,
    "Groups": Groups,
    "Communications": Communications,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};