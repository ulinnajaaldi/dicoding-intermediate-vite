import AddNewStory from '../pages/AddNewStory';
import LoginPage from '../pages/Auth/Login';
import RegisterPage from '../pages/Auth/Register';
import Detail from '../pages/Detail';
import HomePage from '../pages/Homepage';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth';

const routes = {
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),

  '/': () => checkAuthenticatedRoute(new HomePage()),
  '/story/:id': () => checkAuthenticatedRoute(new Detail()),
  '/add-new-story': () => checkAuthenticatedRoute(new AddNewStory()),
};

export default routes;
