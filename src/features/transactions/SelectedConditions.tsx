import { useStore } from '@nanostores/react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { $conditions, Condition, removeCondition } from './state';

function makeLabel(condition: Condition) {
  let value = condition.value;
  if (value instanceof Date) {
    // TODO: locale from settings
    value = Intl.DateTimeFormat('en-UK', {}).format(value);
  }

  return (
    <span>
      {condition.field}{' '}
      <span style={{ color: '#999' }}>{condition.operator}</span> {value}
    </span>
  );
}

export function SelectedConditions() {
  const conditions = useStore($conditions);

  return (
    <Box>
      {conditions.map((condition, i) => (
        <Chip
          label={makeLabel(condition)}
          key={i}
          variant="outlined"
          onDelete={() => removeCondition(i)}
          sx={{ marginRight: 1 }}
        />
      ))}
    </Box>
  );
}
