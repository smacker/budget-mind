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
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {
  $showAddTransactionPopup,
  $showMakeTransferPopup,
} from '../transactions/state';
import Link from '@mui/material/Link';
import { getPagePath } from '@nanostores/router';
import { $router } from '../../router';

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
          sx={{
            '&:hover': {
              '& .actions': {
                opacity: 1,
              },
            },
          }}
        >
          <ListItemText
            primary={
              <Link
                color="inherit"
                underline="none"
                href={getPagePath($router, 'transactions', undefined, {
                  account: account.name,
                })}
              >
                {account.name}
              </Link>
            }
            secondary={
              <Box component="span">
                <Box component="span" sx={{ marginRight: '.2em' }}>
                  {account.lastTransaction &&
                    formatDistance(account.lastTransaction, today)}
                </Box>
                <Box
                  className="actions"
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
                        $showAddTransactionPopup.set({
                          account: account.name,
                          inflow: true,
                        })
                      }
                    >
                      <AddIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Make transfer">
                    <IconButton
                      aria-label="make transfer"
                      size="small"
                      onClick={() =>
                        $showMakeTransferPopup.set({ toAccount: account.name })
                      }
                    >
                      <SwapHorizIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}
