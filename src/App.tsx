/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VibeProvider } from './context/VibeContext';
import { ThemeWrapper } from './components/ThemeWrapper';
import { VibePlayer } from './components/VibePlayer';

export default function App() {
  return (
    <VibeProvider>
      <ThemeWrapper>
        <VibePlayer />
      </ThemeWrapper>
    </VibeProvider>
  );
}
