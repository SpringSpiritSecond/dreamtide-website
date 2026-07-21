import { useEffect, useState } from 'react';
import {
  loadLatestRelease,
  type ReleaseState,
} from '../lib/githubRelease';

export function useLatestRelease() {
  const [state, setState] = useState<ReleaseState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    void loadLatestRelease().then((nextState) => {
      if (active) setState(nextState);
    });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
