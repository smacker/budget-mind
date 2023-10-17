import { useStore } from '@nanostores/react';
import { DashboardTableItem, $currentBudget } from './state';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import { Amount } from '../../core/components/Amount';
import { ColoredAmount } from '../../core/components/ColoredAmount';
import { $showAddTransactionPopup } from '../../features/transactions/state';

function GroupRow({ row }: { row: DashboardTableItem }) {
  return (
    <TableRow
      key={row.name}
      sx={{
        '&:last-child td, &:last-child th': { border: 0 },
        backgroundColor: '#FAFAFA',
      }}
    >
      <TableCell scope="row" sx={{ lineHeight: '28px', fontWeight: 'bold' }}>
        {row.name}
      </TableCell>
      <TableCell align="right" sx={{ color: '#AAAAAA' }}>
        <Amount amount={row.budgeted} />
      </TableCell>
      <TableCell align="right" sx={{ color: '#AAAAAA' }}>
        <Amount amount={row.activity} />
      </TableCell>
      <TableCell align="right" sx={{ color: '#AAAAAA' }}>
        <Amount amount={row.available} />
      </TableCell>
    </TableRow>
  );
}

function CategoryRow({ row }: { row: DashboardTableItem }) {
  return (
    <TableRow
      key={row.name}
      sx={{
        '&:last-child td, &:last-child th': { border: 0 },
      }}
    >
      <TableCell
        scope="row"
        sx={{
          lineHeight: '28px',
          '&:hover': {
            '& .rowActions': {
              opacity: 1,
            },
          },
        }}
      >
        <span style={{ marginRight: '.2em' }}>{row.name}</span>
        <Box
          className="rowActions"
          component="span"
          sx={{
            transition: (theme) => theme.transitions.create('opacity'),
            opacity: 0,
          }}
        >
          <Tooltip title="Add transaction">
            <IconButton
              aria-label="add transaction"
              size="small"
              onClick={() =>
                $showAddTransactionPopup.set({ category: row.name })
              }
            >
              <AddIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
      <TableCell align="right">
        <Amount amount={row.budgeted} />
      </TableCell>
      <TableCell align="right">
        <Amount amount={row.activity} />
      </TableCell>
      <TableCell align="right">
        <ColoredAmount amount={row.available} />
      </TableCell>
    </TableRow>
  );
}

export function BudgetTable() {
  const rows = useStore($currentBudget);

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ lineHeight: '28px' }}>Category</TableCell>
            <TableCell align="right">Budgeted</TableCell>
            <TableCell align="right">Activity</TableCell>
            <TableCell align="right">Available</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) =>
            row.type === 'group' ? (
              <GroupRow key={row.name} row={row} />
            ) : (
              <CategoryRow key={row.name} row={row} />
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
