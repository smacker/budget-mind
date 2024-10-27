import { forwardRef } from 'react';
import { useStore } from '@nanostores/react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { TableVirtuoso, TableComponents } from 'react-virtuoso';

import { TransactionTableItem, $processedTransactions } from './state';
import { Amount } from '../../core/components/Amount';

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
  TableHead,
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
        let value: any = row[column.dataKey];
        if (typeof value === 'object') {
          value = Intl.DateTimeFormat('en-UK', {}).format(value);
        }
        if (column.dataKey === 'status') {
          value = value === 'settled' ? '✅' : '🅿️';
        }
        if (column.dataKey === 'outflow' && value) {
          value = <Amount amount={-value} textColor="red" />;
        }
        if (column.dataKey === 'inflow' && value) {
          value = <Amount amount={value} textColor="green" />;
        }

        return (
          <TableCell
            key={column.dataKey}
            align={column.numeric || false ? 'right' : 'left'}
          >
            {value}
          </TableCell>
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
