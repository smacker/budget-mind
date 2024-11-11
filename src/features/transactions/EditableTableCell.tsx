import { useState } from 'react';
import { useStore } from '@nanostores/react';

import TableCell, { TableCellProps } from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import DeleteIcon from '@mui/icons-material/Delete';

import { Amount } from '../../core/components/Amount';
import AmountInput from '../../core/components/AmountInput';
import ConfirmableInput from '../../core/components/ConfirmableInput';
import { $accounts, $categories } from '../../core/state';
import { TransactionTableItem } from './state';
import { useTheme } from '@mui/material';

interface ColumnData {
  dataKey: keyof TransactionTableItem;
}

function TextValue({
  value,
  column,
}: {
  value: Date | React.ReactNode;
  column: ColumnData;
}) {
  const theme = useTheme();

  if (value instanceof Date) {
    return Intl.DateTimeFormat('en-UK', {}).format(value);
  }
  if (column.dataKey === 'status') {
    return value === 'settled' ? '✅' : '🅿️';
  }
  if (column.dataKey === 'outflow' && typeof value === 'number') {
    return <Amount amount={-value} textColor={theme.palette.amount.negative} />;
  }
  if (column.dataKey === 'inflow' && typeof value === 'number') {
    return <Amount amount={value} textColor={theme.palette.amount.positive} />;
  }

  return value;
}

export default function EditableTableCell(
  props: Omit<TableCellProps, 'children' | 'onChange'> & {
    value: Date | React.ReactNode;
    column: ColumnData;
    onChange: (v: string | number | Date) => void;
  }
) {
  const { value, column, onChange, ...rest } = props;

  const accounts = useStore($accounts);
  const categories = useStore($categories);

  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  let children: React.ReactNode;
  if (isHovered || isFocused) {
    switch (column.dataKey) {
      case 'date':
        children = (
          <DatePicker
            value={value as Date}
            onChange={(e) => {
              if (e) {
                setIsFocused(false);
                setIsHovered(false);
                onChange(e);
              }
            }}
            /* FIXME: this should be coming from locale */
            format="dd/MM/yyyy"
            sx={{
              position: 'absolute',
              display: 'block',
              top: 0,
              bottom: 0,
              left: '10px',
              right: '10px',
              input: {
                fontSize: '0.875rem',
                padding: '6px',
              },
              '& .MuiInputAdornment-root': {
                marginLeft: 0,
              },
              '& MuiButtonBase-root': {
                padding: 0,
              },
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
              },
            }}
          />
        );
        break;
      case 'outflow': {
        const amount = (value || 0) as number;
        children = (
          <AmountInput
            amount={amount ? -amount : 0}
            onChange={(v) => {
              if (!v && !value) {
                return;
              }
              onChange(v ? -v : 0);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            sx={{
              position: 'absolute',
              display: 'block',
              top: 0,
              bottom: 0,
              left: '10px',
              right: '10px',
              input: {
                fontSize: '0.875rem',
                padding: '6px',
              },
            }}
          />
        );
        break;
      }
      case 'inflow':
        children = (
          <AmountInput
            amount={(value || 0) as number}
            onChange={(v) => {
              if (!v && !value) {
                return;
              }
              onChange(v);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            sx={{
              position: 'absolute',
              display: 'block',
              top: 0,
              bottom: 0,
              left: '10px',
              right: '10px',
              input: {
                fontSize: '0.875rem',
                padding: '6px',
              },
            }}
          />
        );
        break;
      case 'category':
        children = (
          <Autocomplete
            renderInput={(params) => (
              <TextField
                sx={{
                  position: 'absolute',
                  display: 'block',
                  top: 0,
                  bottom: 0,
                  left: '10px',
                  right: '10px',
                  input: {
                    fontSize: '0.875rem',
                  },
                  '& .MuiOutlinedInput-root.MuiInputBase-sizeSmall .MuiAutocomplete-input':
                    {
                      padding: 0,
                    },
                  '& .MuiAutocomplete-option': {
                    fontSize: '0.875rem',
                  },
                }}
                {...params}
              />
            )}
            options={categories}
            getOptionLabel={(option) => option.name}
            groupBy={(option) => option.group}
            filterSelectedOptions
            fullWidth
            disableClearable
            value={categories.find((c) => c.name === value)}
            size="small"
            onChange={(_e, value) => {
              setIsFocused(false);
              setIsHovered(false);
              onChange(value.name);
            }}
          />
        );
        break;
      case 'account':
        children = (
          <Autocomplete
            renderInput={(params) => (
              <TextField
                sx={{
                  position: 'absolute',
                  display: 'block',
                  top: 0,
                  bottom: 0,
                  left: '10px',
                  right: '10px',
                  input: {
                    fontSize: '0.875rem',
                  },
                  '& .MuiOutlinedInput-root.MuiInputBase-sizeSmall .MuiAutocomplete-input':
                    {
                      padding: 0,
                    },
                }}
                {...params}
              />
            )}
            options={accounts}
            getOptionLabel={(option) => option.name}
            filterSelectedOptions
            fullWidth
            disableClearable
            value={accounts.find((c) => c.name === value)}
            size="small"
            onChange={(_e, value) => {
              setIsFocused(false);
              setIsHovered(false);
              onChange(value.name);
            }}
          />
        );
        break;
      case 'memo':
        children = (
          <ConfirmableInput
            value={value as string}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(v) => {
              setIsFocused(false);
              setIsHovered(false);
              onChange(v);
            }}
          />
        );
        break;
      case 'status':
        children = (
          <Paper
            sx={{
              position: 'absolute',
              top: 0,
              marginLeft: '-8px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1,
              padding: '3px',
            }}
          >
            <Button
              variant="text"
              sx={{ padding: 0, minWidth: 0, marginBottom: '5px' }}
              onClick={() => {
                const newValue = value === 'settled' ? 'pending' : 'settled';
                onChange(newValue);
              }}
            >
              <TextValue value={value} column={column} />
            </Button>
            <Button
              variant="text"
              sx={{ padding: 0, minWidth: 0, lineHeight: 0 }}
              onClick={() => onChange('delete')}
            >
              <DeleteIcon color="error" />
            </Button>
          </Paper>
        );
        break;
    }
  } else {
    children = <TextValue value={value} column={column} />;
  }

  return (
    <TableCell
      {...rest}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ position: 'relative' }}
    >
      {children}
    </TableCell>
  );
}
