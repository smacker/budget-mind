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
import { SteppedAmount } from '../../core/components/SteppedAmount';
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
      <TableCell></TableCell>
    </TableRow>
  );
}

function Progress({ value }: { value?: number }) {
  if (!value) {
    return null;
  }

  if (value > 100) {
    value = 100;
  }

  const size = 24;
  const borderWith = 4;
  const radius = size / 2;
  const circumference = 2 * Math.PI * (radius - borderWith);

  let content;
  let rotate = false;
  if (value < 0) {
    content = (
      <path
        fill="red"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
      />
    );
  } else if (value === 100) {
    content = (
      <path
        fill="green"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      />
    );
  } else {
    rotate = true;
    const color = value > 30 ? 'green' : 'orange';
    content = (
      <>
        <circle
          r={radius - borderWith}
          cx="50%"
          cy="50%"
          fill="none"
          stroke="#f0f0f0"
          strokeWidth={borderWith}
        ></circle>
        <circle
          r={radius - borderWith}
          cx="50%"
          cy="50%"
          fill="none"
          strokeDasharray={`${(value * circumference) / 100} ${circumference}`}
          stroke={color}
          strokeWidth={borderWith}
        ></circle>
      </>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      transform={rotate ? 'rotate(-90)' : undefined}
    >
      {content}
    </svg>
  );
}

function CategoryRow({ row }: { row: DashboardTableItem }) {
  let progress;
  if (row.goal) {
    progress = Math.round((row.available / row.goal) * 100);
  } else if (row.monthlyBudget) {
    progress = Math.round((row.available / row.monthlyBudget) * 100);
  }

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
        <SteppedAmount
          amount={row.available}
          target={row.goal || row.monthlyBudget}
        />
      </TableCell>
      <TableCell>
        <Progress value={progress} />
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
            <TableCell></TableCell>
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
