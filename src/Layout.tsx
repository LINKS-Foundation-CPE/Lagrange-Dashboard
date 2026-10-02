import type { ReactNode } from "react";
import { Layout as RALayout, CheckForApplicationUpdate } from "react-admin";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { CustomMenu } from './CustomMenu';
import { CustomAppBar } from "./CustomAppBar";

export const Layout = ({ children }: { children: ReactNode }) => (
  <>
    <RALayout menu={CustomMenu} appBar={CustomAppBar}>
      {children}
      <CheckForApplicationUpdate />
    </RALayout>
    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
  </>
);
