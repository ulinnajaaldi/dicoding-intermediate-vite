export const generateNavigationUnauthenticated = () => {
  return `
        <li><a class="block px-3 py-2 text-gray-800 hover:underline" href="#/login">Login</a></li>
        <li><a class="block px-3 py-2 text-gray-800 hover:underline" href="#/register">Register</a></li>
    `;
};

export const generateNavigationAuthenticated = () => {
  return `
    <li><a class="block px-3 py-2 text-gray-800 hover:underline" href="#/profile">Profile</a></li>
    <li><a class="block px-3 py-2 text-gray-800 hover:underline" href="#/stories">Stories</a></li>
    <li><a id="logout-button" class="block px-3 py-2 text-gray-800 hover:underline" href="#/logout">Logout</a></li>
    `;
};
