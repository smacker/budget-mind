import { ComponentPropsWithoutRef, forwardRef } from 'react';
import { useStore } from '@nanostores/react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { TableVirtuoso, TableComponents } from 'react-virtuoso';

import EditableTableCell from './EditableTableCell';

import {
  TransactionTableItem,
  $processedTransactions,
  updateTransaction,
} from './state';

interface ColumnData {
  dataKey: keyof TransactionTableItem;
  label: string;
  numeric?: boolean;
  width: number;
}

const columns: ColumnData[] = [
  {
    width: 100,
    label: 'Date',
    dataKey: 'date',
  },
  {
    width: 100,
    label: 'Outflow',
    dataKey: 'outflow',
    numeric: true,
  },
  {
    width: 100,
    label: 'Inflow',
    dataKey: 'inflow',
    numeric: true,
  },
  {
    width: 200,
    label: 'Category',
    dataKey: 'category',
  },
  {
    width: 200,
    label: 'Account',
    dataKey: 'account',
  },
  {
    width: 300,
    label: 'Memo',
    dataKey: 'memo',
  },
  {
    width: 40,
    label: '',
    dataKey: 'status',
  },
];

const VirtuosoTableComponents: TableComponents<TransactionTableItem> = {
  Scroller: forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      size="small"
      {...props}
      sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }}
    />
  ),
  TableHead: forwardRef((props: ComponentPropsWithoutRef<'thead'>, ref) => (
    <TableHead ref={ref} {...props} />
  )),
  TableRow: ({ item: _item, ...props }) => <TableRow hover {...props} />,
  TableBody: forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

function fixedHeaderContent() {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          align={column.numeric || false ? 'right' : 'left'}
          style={{ width: column.width }}
          sx={{
            backgroundColor: 'background.paper',
          }}
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );
}

function rowContent(_index: number, row: TransactionTableItem) {
  return (
    <>
      {columns.map((column) => {
        return (
          <EditableTableCell
            key={column.dataKey}
            align={column.numeric || false ? 'right' : 'left'}
            value={row[column.dataKey]}
            column={column}
            onChange={(v) => {
              let key = column.dataKey;
              if (key === 'outflow' || key === 'inflow') {
                key = 'amount';
              }
              updateTransaction({ ...row, [key]: v });
            }}
          />
        );
      })}
    </>
  );
}

export function TransactionsTable() {
  const transactions = useStore($processedTransactions);

  return (
    <TableVirtuoso
      data={transactions}
      components={VirtuosoTableComponents}
      fixedHeaderContent={fixedHeaderContent}
      itemContent={rowContent}
    />
  );
}
