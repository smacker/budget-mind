import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useCallback, useState } from 'react';
import {
  StringCondition,
  StringOperator,
  StringField,
  Operator,
  MultiStringCondition,
  MultiStringOperator,
  stringOperators,
  multiStringOperators,
  DateField,
  DateCondition,
  DateOperator,
  dateOperators,
  NumberField,
  NumberCondition,
  NumberOperator,
  numberOperators,
} from './state';

function ConditionChip<T extends Operator>({
  type,
  currentType,
  onClick,
}: {
  type: T;
  currentType: T;
  onClick: (type: T) => void;
}) {
  return (
    <Chip
      label={type}
      size="small"
      variant={currentType === type ? 'filled' : 'outlined'}
      sx={{ marginRight: '5px' }}
      onClick={() => onClick(type)}
    />
  );
}

const inputStyles = {
  size: 'small',
  sx: { width: 250, marginBottom: '10px' },
} as const;

export function DateFilterBox({
  field,
  onApply,
}: {
  field: DateField;
  onApply: (condition: DateCondition) => void;
}) {
  const [selectedType, setSelectedType] = useState<DateOperator>('is');
  const [value, setValue] = useState<Date | null>(null);

  const onSubmit = useCallback(
    () => value && onApply({ field, operator: selectedType, value }),
    [onApply, field, selectedType, value]
  );

  return (
    <Paper sx={{ padding: '10px' }}>
      <Box sx={{ marginBottom: '10px' }}>
        {dateOperators.map((type) => (
          <ConditionChip
            key={type}
            type={type}
            currentType={selectedType}
            onClick={() => setSelectedType(type)}
          />
        ))}
      </Box>
      <DatePicker value={value} onChange={setValue} {...inputStyles} />
      <Box textAlign="right">
        <Button size="small" onClick={onSubmit}>
          Apply
        </Button>
      </Box>
    </Paper>
  );
}

export function StringFilterBox<OptionT>({
  field,
  options,
  onApply,
}: {
  field: StringField;
  options?: readonly OptionT[];
  onApply: (condition: StringCondition | MultiStringCondition) => void;
}) {
  const [selectedType, setSelectedType] = useState<
    StringOperator | MultiStringOperator
  >('is');
  const [value, setValue] = useState<string | string[] | null>(null);

  const label = `${field[0].toUpperCase()}${field.slice(1)}`;

  const onSubmit = useCallback(
    () =>
      value && onApply({ field, operator: selectedType, value: value as any }),
    [onApply, field, selectedType, value]
  );

  const onConditionClick = (type: StringOperator | MultiStringOperator) => {
    const prevCondition = selectedType;
    setSelectedType(type);

    switch (type) {
      case 'is':
        setValue((prevValue) =>
          prevCondition === 'one of' && prevValue?.length == 1
            ? prevValue[0]
            : null
        );
        break;
      case 'contains':
        setValue('');
        break;
      case 'one of':
        setValue((prevValue) =>
          prevCondition === 'is' && prevValue ? [prevValue as string] : []
        );
        break;
      default: {
        const _: never = type;
        throw new Error(`Unknown condition type: ${type}`);
      }
    }
  };

  let input;
  if (selectedType === 'contains') {
    input = (
      <TextField
        value={value || ''}
        onChange={(e) => setValue(e.target.value)}
        label={label}
        onKeyUp={(e) => e.key === 'Enter' && onSubmit()}
        {...inputStyles}
      />
    );
  } else {
    const multiple = selectedType === 'one of';
    input = (
      <Autocomplete
        renderInput={(params) => <TextField {...params} label={label} />}
        value={value}
        onChange={(_event: unknown, newValue: unknown) =>
          setValue(newValue as string | string[] | null)
        }
        options={options || []}
        filterSelectedOptions={!!options}
        freeSolo={!options}
        multiple={multiple}
        defaultValue={multiple ? [] : undefined}
        {...inputStyles}
      />
    );
  }

  return (
    <Paper sx={{ padding: '10px' }}>
      <Box sx={{ marginBottom: '10px' }}>
        {[...stringOperators, ...multiStringOperators].map((type) => (
          <ConditionChip
            key={type}
            type={type}
            currentType={selectedType}
            onClick={onConditionClick}
          />
        ))}
      </Box>
      {input}
      <Box textAlign="right">
        <Button size="small" onClick={onSubmit}>
          Apply
        </Button>
      </Box>
    </Paper>
  );
}

export function NumberFilterBox({
  field,
  onApply,
}: {
  field: NumberField;
  onApply: (condition: NumberCondition) => void;
}) {
  const [selectedType, setSelectedType] = useState<NumberOperator>('is');
  const [value, setValue] = useState<number | null>(null);

  const onSubmit = useCallback(
    () => value && onApply({ field, operator: selectedType, value }),
    [onApply, field, selectedType, value]
  );

  return (
    <Paper sx={{ padding: '10px' }}>
      <Box sx={{ marginBottom: '10px' }}>
        {numberOperators.map((type) => (
          <ConditionChip
            key={type}
            type={type}
            currentType={selectedType}
            onClick={() => setSelectedType(type)}
          />
        ))}
      </Box>
      <TextField
        type="number"
        value={value || ''}
        onChange={(e) =>
          setValue(e.target.value === '' ? null : +e.target.value)
        }
        onKeyUp={(e) => e.key === 'Enter' && onSubmit()}
        {...inputStyles}
      />
      <Box textAlign="right">
        <Button size="small" onClick={onSubmit}>
          Apply
        </Button>
      </Box>
    </Paper>
  );
}
