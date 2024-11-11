import { useStore } from '@nanostores/react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { format } from 'date-fns';
import { $conditions, Condition, removeCondition } from './state';
import { useTheme } from '@mui/material/styles';

function Label(condition: Condition) {
  const theme = useTheme();

  let value = condition.value;
  if (value instanceof Date) {
    if ('type' in condition && condition.type === 'month') {
      value = format(value, 'MMMM yyyy');
    } else if ('type' in condition && condition.type === 'year') {
      value = format(value, 'yyyy');
    } else {
      value = Intl.DateTimeFormat('en-UK', {}).format(value);
    }
  }

  return (
    <span>
      {condition.field}{' '}
      <span style={{ color: theme.palette.text.disabled }}>
        {condition.operator}
      </span>{' '}
      {value}
    </span>
  );
}

export function SelectedConditions() {
  const conditions = useStore($conditions);

  return (
    <Box>
      {conditions.map((condition, i) => (
        <Chip
          label={Label(condition)}
          key={i}
          variant="outlined"
          onDelete={() => removeCondition(i)}
          sx={{ marginRight: 1 }}
        />
      ))}
    </Box>
  );
}
