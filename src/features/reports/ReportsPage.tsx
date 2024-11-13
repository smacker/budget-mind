import Box from '@mui/material/Box';
import Main from '../../layout/Main';
import TrendReport from './TrendReport';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { $router } from '../../router';
import { getPagePath } from '@nanostores/router';
import AccountsReport from './AccountsReport';

function ReportsAppBar(props: { tab: string }) {
  return (
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
