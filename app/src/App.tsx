// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useRoutes } from 'react-router-dom';

import ErrorPage from './pages/error-page';
import { routes } from './routes';

/**
 * Main Application Component
 *
 * This component serves as the root of the application's routing structure.
 * It defines all available routes and their corresponding components using React Router.
 * The routes are organized into different sections based on authentication requirements
 * and layout configurations (sidebar, padding).
 *
 * Route Categories:
 * - Authenticated routes with sidebar and padding (main app pages)
 * - Authenticated routes without sidebar (specific features)
 * - Public routes (account creation flows)
 * - Explorer routes (special layout)
 * - Welcome and standalone pages
 */
function App() {
  const element = useRoutes(routes);

  return <ErrorPage>{element}</ErrorPage>;
}

export default App;
