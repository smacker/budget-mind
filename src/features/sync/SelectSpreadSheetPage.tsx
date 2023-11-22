import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import { useEffect } from 'react';
import { useStore } from '@nanostores/react';

import Main from '../../layout/Main';
import {
  $spreadSheetId,
  $spreadSheetIdStatus,
  $spreadsheets,
  loadSpreadsheets,
} from './state';
import { $token } from './google';

function SelectSpreadSheetAppBar() {
  return (
    <Typography variant="h4" component="div">
      Select Aspire Spreadsheet
    </Typography>
  );
}

function SpreadsheetSelector() {
  const token = useStore($token);
  const spreadsheets = useStore($spreadsheets);

  useEffect(() => {
    if (!token) {
      $spreadsheets.set([]);
      return;
    }

    loadSpreadsheets(token);
  }, [token]);

  return (
    <List>
      {spreadsheets.map((spreadsheet) => (
        <ListItem key={spreadsheet.id} disablePadding>
          <ListItemButton onClick={() => $spreadSheetId.set(spreadsheet.id)}>
            <ListItemText primary={spreadsheet.name} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}

export default function SelectSpreadSheetPage() {
  const spreadSheetStatus = useStore($spreadSheetIdStatus);

  return (
    <Main appBarChildren={<SelectSpreadSheetAppBar />}>
      {spreadSheetStatus === 'error' ? (
        <Alert severity="error">
          Please make sure the spreadsheet is an Aspire Budgeting spreadsheet
          and try again
        </Alert>
      ) : null}
      {spreadSheetStatus === 'unknown' || spreadSheetStatus === 'error' ? (
        <SpreadsheetSelector />
      ) : (
        <Box sx={{ paddingTop: 6, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      )}
    </Main>
  );
}
