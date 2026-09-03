/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import AppRoutes from './routes';
import InstallGate from './components/Install';

export default function App() {
  return (
    <InstallGate>
      <AppRoutes />
    </InstallGate>
  );
}
