import { FC, ReactElement, Suspense } from 'react';
import { Spin } from 'antd';

export const Common: FC<{ component: ReactElement }> = ({ component }): ReactElement =>
  <Suspense fallback={<Spin spinning={true} />}>{component}</Suspense>;