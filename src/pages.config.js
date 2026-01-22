import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import Commissions from './pages/Commissions';
import MapView from './pages/MapView';
import Reminders from './pages/Reminders';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Properties": Properties,
    "PropertyDetails": PropertyDetails,
    "Clients": Clients,
    "ClientDetails": ClientDetails,
    "Commissions": Commissions,
    "MapView": MapView,
    "Reminders": Reminders,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};