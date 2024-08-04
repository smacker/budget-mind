import { useEffect, useState } from 'react';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { Locale } from 'date-fns';

import NotFoundPage from './layout/NotFoundPage';
import LoadingPage from './layout/LoadingPage';
import MenuSidebar from './layout/MenuSidebar';
import WelcomePage from './layout/WelcomePage';
import SelectSpreadSheetPage from './features/sync/SelectSpreadSheetPage';
import DashboardPage from './features/dashboard/DashboardPage';
import TransactionsPage from './features/transactions/TransactionsPage';
import { AddTransactionDialog } from './features/transactions/AddTransaction';

import { useStore } from '@nanostores/react';
import { useHotkeys } from 'react-hotkeys-hook';
import { $router } from './router';
import { $isLoggedIn } from './features/sync/google';
import { $importStatus } from './features/sync/state';
import { $showAddTransactionPopup } from './features/transactions/state';
import { $aspireSpreadSheetId } from './features/sync/aspire';

declare module '@mui/material/styles' {
  interface TypeBackground {
    secondary: string;
  }
}

const defaultTheme = createTheme({
  palette: {
    background: {
      secondary: '#FAFAFA',
    },
  },
});

function Route() {
  const page = useStore($router);
  const isLoggedIn = useStore($isLoggedIn);
  const spreadSheetId = useStore($aspireSpreadSheetId);
  const importStatus = useStore($importStatus);

  if (!page) {
    return <NotFoundPage />;
  }

  if (!isLoggedIn) {
    return <WelcomePage />;
  }

  if (!spreadSheetId) {
    return <SelectSpreadSheetPage />;
  }

  if (importStatus === 'loading') {
    return <LoadingPage />;
  }

  const { route } = page;
  switch (route) {
    case 'dashboard':
      return <DashboardPage />;
    case 'transactions':
      return <TransactionsPage />;
    default: {
      const _: never = route;
      throw new Error(`Unexpected route ${route}`);
    }
  }
}

function App() {
  const isLoggedIn = useStore($isLoggedIn);
  const showAddTransactionPopup = useStore($showAddTransactionPopup);
  const [locale, setLocale] = useState<Locale | undefined>();

  useHotkeys('a', () => isLoggedIn && $showAddTransactionPopup.set({}), {
    keyup: true,
  });

  useEffect(() => {
    const run = async () => {
      // TODO we should use `navigator.language` by default and override it from settings
      // but there is no settings yet :)
      //
      // const localeName = navigator.language;
      const localeName = 'en-GB';
      try {
        const locale: { default: Locale } = await import(
          `../node_modules/date-fns/locale/${localeName}.mjs`
        );
        setLocale(locale.default);
      } catch (e) {
        console.warn(`can't load locale ${localeName}`);
        console.error(e);
      }
    };

    run();
  });

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
        <Box display="flex">
          <MenuSidebar />
          <Route />
        </Box>
        {isLoggedIn ? (
          <AddTransactionDialog
            open={!!showAddTransactionPopup}
            onClose={() => $showAddTransactionPopup.set(false)}
            defaultValues={
              showAddTransactionPopup ? showAddTransactionPopup : undefined
            }
          />
        ) : null}
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
