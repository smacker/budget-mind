import { useStore } from '@nanostores/react';
import {
  formatDistance as _formatDistance,
  isEqual,
  differenceInDays,
} from 'date-fns';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { $accountSummary, $today } from './state';
import { ColoredAmount } from '../../core/components/ColoredAmount';

function formatDistance(a: Date, b: Date) {
  if (isEqual(a, b)) {
    return 'today';
  }
  if (differenceInDays(a, b) === -1) {
    return 'yesterday';
  }

  return _formatDistance(a, b, { addSuffix: true });
}

export function AccountsSummary() {
  const accounts = useStore($accountSummary);
  const today = useStore($today);

  return (
    <List>
      {accounts.map((account) => (
        <ListItem
          key={account.name}
          secondaryAction={
            <Typography>
              <ColoredAmount amount={account.amount} />
            </Typography>
          }
        >
          <ListItemText
            primary={account.name}
            secondary={
              account.lastTransaction &&
              formatDistance(account.lastTransaction, today)
            }
          />
        </ListItem>
      ))}
    </List>
  );
}
