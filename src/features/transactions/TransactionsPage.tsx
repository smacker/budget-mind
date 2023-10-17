import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Filters } from './Filters';
import { SelectedConditions } from './SelectedConditions';
import { TransactionsTable } from './TransactionsTable';
import Main from '../../layout/Main';
import { $conditions } from './state';
import { useStore } from '@nanostores/react';

function TransactionsAppBar() {
  return (
    <Box display="flex" alignItems="center">
      <Typography
        variant="h5"
        noWrap
        component="div"
        sx={{
          fontWeight: 'bold',
          color: '#A3A3A3',
          marginRight: 1,
        }}
      >
        Filter transaction by
      </Typography>
      <Filters />
    </Box>
  );
}

export default function Transactions() {
  const conditions = useStore($conditions);

  return (
    <Main appBarChildren={<TransactionsAppBar />}>
      <Box display="flex" flexDirection="column" sx={{ height: '100%' }}>
        {conditions.length ? (
          <Box marginBottom={2}>
            <SelectedConditions />
          </Box>
        ) : null}
        <TransactionsTable />
      </Box>
    </Main>
  );
}
