import { ReactElement, FC, Suspense } from 'react';

export const Common: FC<{ component: ReactElement }> = ({
  component,
}): ReactElement => (
  <Suspense fallback={<p>Loading...</p>}>{component}</Suspense>
);