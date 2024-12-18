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
import { $locale } from './core/state';
import { loadLocale } from './core/locales';

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
import {
  $showAddTransactionPopup,
  $showMakeTransferPopup,
} from './features/transactions/state';
import { $aspireSpreadSheetId } from './features/sync/aspire';
import { MakeTransferDialog } from './features/transactions/MakeTransfer';
import ReportsPage from './features/reports/ReportsPage';
import SettingsPage from './features/settings/SettingsPage';

declare module '@mui/material/styles' {
  interface Palette {
    amount: {
      negative: string;
      positive: string;
    };
  }
  interface TypeBackground {
    secondary: string;
  }
  interface PaletteOptions {
    amount: {
      negative: string;
      positive: string;
    };
  }
}

const defaultTheme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        background: {
          secondary: '#FAFAFA',
        },
        amount: {
          negative: '#d32f2f',
          positive: '#2e7d32',
        },
      },
    },
    dark: {
      palette: {
        background: {
          secondary: '#1F1F1F',
        },
        amount: {
          negative: '#f44336',
          positive: '#66bb6a',
        },
      },
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
    case 'reports':
      return <ReportsPage tab={page.params.tab} />;
    case 'settings':
      return <SettingsPage />;
    default: {
      const _: never = route;
      throw new Error(`Unexpected route ${route}`);
    }
  }
}

function App() {
  const locale = useStore($locale);
  const isLoggedIn = useStore($isLoggedIn);
  const showAddTransactionPopup = useStore($showAddTransactionPopup);
  const showMakeTransferPopup = useStore($showMakeTransferPopup);
  const [dateFnsLocale, setDateFnsLocale] = useState<Locale | undefined>();

  useHotkeys('a', () => isLoggedIn && $showAddTransactionPopup.set({}), {
    keyup: true,
  });
  useHotkeys('t', () => isLoggedIn && $showMakeTransferPopup.set({}), {
    keyup: true,
  });

  useEffect(() => {
    const run = async () => {
      const dateFnsLocale = await loadLocale(locale);
      if (dateFnsLocale) {
        setDateFnsLocale(dateFnsLocale);
      }
    };

    run();
  }, [locale]);

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={dateFnsLocale}
      >
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
        {isLoggedIn ? (
          <MakeTransferDialog
            open={!!showMakeTransferPopup}
            onClose={() => $showMakeTransferPopup.set(false)}
            defaultValues={
              showMakeTransferPopup ? showMakeTransferPopup : undefined
            }
          />
        ) : null}
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
