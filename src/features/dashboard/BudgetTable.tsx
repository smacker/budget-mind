import { useStore } from '@nanostores/react';
import {
  DashboardTableItem,
  $currentBudget,
  addToBudgetCategory,
} from './state';

import { Link, useTheme } from '@mui/material';
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
import { AvailableAmount } from './AvailableAmount';
import { BudgetedInput } from './BudgetedInput';
import { $showAddTransactionPopup } from '../../features/transactions/state';
import { getPagePath } from '@nanostores/router';
import { $router } from '../../router';

function GroupRow({ row }: { row: DashboardTableItem }) {
  return (
    <TableRow
      key={row.name}
      sx={{
        '&:last-child td, &:last-child th': { border: 0 },
        backgroundColor: 'background.secondary',
      }}
    >
      <TableCell scope="row" sx={{ lineHeight: '28px', fontWeight: 'bold' }}>
        {row.name}
      </TableCell>
      <TableCell
        align="right"
        sx={{ color: 'text.disabled', paddingRight: '22px' }}
      >
        <Amount amount={row.budgeted} />
      </TableCell>
      <TableCell align="right" sx={{ color: 'text.disabled' }}>
        <Amount amount={row.activity} />
      </TableCell>
      <TableCell align="right" sx={{ color: 'text.disabled' }}>
        <Amount amount={row.available} />
      </TableCell>
      <TableCell sx={{ paddingLeft: 0 }}></TableCell>
    </TableRow>
  );
}

function Progress({ value }: { value?: number }) {
  const theme = useTheme();

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
        fill={theme.palette.amount.negative}
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
      />
    );
  } else if (value === 100) {
    content = (
      <path
        fill={theme.palette.amount.positive}
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      />
    );
  } else {
    rotate = true;
    const color =
      value > 30 ? theme.palette.amount.positive : theme.palette.warning.main;
    content = (
      <>
        <circle
          r={radius - borderWith}
          cx="50%"
          cy="50%"
          fill="none"
          stroke={theme.palette.background.secondary}
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
      hover
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
        <Link
          style={{ marginRight: '.2em' }}
          color="inherit"
          underline="none"
          href={getPagePath($router, 'transactions', undefined, {
            category: row.name,
          })}
        >
          {row.name}
        </Link>
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
        <BudgetedInput
          amount={row.budgeted}
          onChange={(v) => addToBudgetCategory(row.name, v - row.budgeted)}
          monthlyBudget={row.monthlyBudget}
          available={row.available}
          goal={row.goal}
        />
      </TableCell>
      <TableCell align="right">
        <Amount amount={row.activity} />
      </TableCell>
      <TableCell align="right">
        <AvailableAmount
          categoryName={row.name}
          amount={row.available}
          target={row.goal || row.monthlyBudget}
        />
      </TableCell>
      <TableCell sx={{ paddingLeft: 0 }}>
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
            <TableCell align="right" width={150} sx={{ paddingRight: '22px' }}>
              Budgeted
            </TableCell>
            <TableCell align="right" width={144}>
              Activity
            </TableCell>
            <TableCell align="right" width={150}>
              Available
            </TableCell>
            <TableCell width={40} sx={{ paddingLeft: 0 }}></TableCell>
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
