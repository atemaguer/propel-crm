import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';


export const PAGES = {
    "Dashboard": Dashboard,
    "Properties": Properties,
    "PropertyDetails": PropertyDetails,
    "Clients": Clients,
    "ClientDetails": ClientDetails,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
};