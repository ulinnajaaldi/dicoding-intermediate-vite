import LoginPage from '../pages/Auth/Login';
import RegisterPage from '../pages/Auth/Register';
import HomePage from '../pages/Homepage';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth';

const routes = {
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  '/': () => checkAuthenticatedRoute(new HomePage()),
};

export default routes;
