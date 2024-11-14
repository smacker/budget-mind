import Box from '@mui/material/Box';
import Main from '../../layout/Main';
import TrendReport from './TrendReport';
import { Button, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { $router } from '../../router';
import { getPagePath } from '@nanostores/router';
import AccountsReport from './AccountsReport';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useStore } from '@nanostores/react';
import {
  $selectedDateRange,
  selectAllRange,
  selectLastYearRange,
} from './state';

function ReportsAppBar(props: { tab: string }) {
  const selectedDateRange = useStore($selectedDateRange);

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <ToggleButtonGroup exclusive value={props.tab}>
        <ToggleButton value="trends" href={getPagePath($router, 'reports')}>
          Trends
        </ToggleButton>
        <ToggleButton
          value="accounts"
          href={getPagePath($router, 'reports', { tab: 'accounts' })}
        >
          Accounts
        </ToggleButton>
        <ToggleButton
          value="category"
          href={getPagePath($router, 'reports', { tab: 'category' })}
        >
          Category
        </ToggleButton>
        <ToggleButton
          value="spending"
          href={getPagePath($router, 'reports', { tab: 'spending' })}
        >
          Spending
        </ToggleButton>
      </ToggleButtonGroup>
      <Stack direction="row">
        <DatePicker
          value={selectedDateRange.start}
          onChange={(v) => v && $selectedDateRange.setKey('start', v)}
          /* FIXME: this should be coming from locale */
          format="dd/MM/yyyy"
          slotProps={{
            textField: {
              label: 'Start Date',
              size: 'small',
            },
          }}
          sx={{ marginRight: '1em' }}
        />
        <DatePicker
          value={selectedDateRange.end}
          onChange={(v) => v && $selectedDateRange.setKey('end', v)}
          /* FIXME: this should be coming from locale */
          format="dd/MM/yyyy"
          slotProps={{
            textField: {
              label: 'End Date',
              size: 'small',
            },
          }}
          sx={{ marginRight: '1em' }}
        />
        <Button onClick={selectAllRange}>All Data</Button>
        <Button onClick={selectLastYearRange}>Last Year</Button>
      </Stack>
    </Stack>
  );
}

export default function Reports(props: { tab?: string }) {
  let tab = props.tab || 'trends';
  if (!['trends', 'accounts', 'category', 'spending'].includes(tab)) {
    tab = 'trends';
  }

  let child: React.ReactNode;
  switch (tab) {
    case 'trends':
      child = <TrendReport />;
      break;
    case 'accounts':
      child = <AccountsReport />;
      break;
    case 'category':
      child = <div>Category</div>;
      break;
    case 'spending':
      child = <div>Spending</div>;
      break;
  }

  return (
    <Main appBarChildren={<ReportsAppBar tab={tab} />}>
      <Box display="flex" flexDirection="column" sx={{ height: '100%' }}>
        {child}
      </Box>
    </Main>
  );
}
