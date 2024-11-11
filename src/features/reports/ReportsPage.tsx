import Box from '@mui/material/Box';
import Main from '../../layout/Main';
import TrendReport from './TrendReport';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';

function ReportsAppBar() {
  return (
    <ButtonGroup>
      <Button>Trends</Button>
      <Button>Accounts</Button>
      <Button>Category</Button>
      <Button>Spending</Button>
    </ButtonGroup>
  );
}

export default function Reports() {
  return (
    <Main appBarChildren={<ReportsAppBar />}>
      <Box display="flex" flexDirection="column" sx={{ height: '100%' }}>
        <TrendReport />
      </Box>
    </Main>
  );
}
