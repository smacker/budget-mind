import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import { useStore } from '@nanostores/react';

import Main from '../../layout/Main';
import { $spreadSheetId, $spreadsheets } from './state';
import { $spreadSheetIdIsValidating, $spreadSheetIdStatus } from './aspire';

function SelectSpreadSheetAppBar() {
  return (
    <Typography variant="h4" component="div">
      Select Aspire Spreadsheet
    </Typography>
  );
}

function SpreadsheetSelector() {
  const spreadsheets = useStore($spreadsheets);

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
  const spreadSheetIdIsValidating = useStore($spreadSheetIdIsValidating);

  return (
    <Main
      appBarChildren={
        spreadSheetIdIsValidating ? undefined : <SelectSpreadSheetAppBar />
      }
    >
      {spreadSheetStatus === 'error' ? (
        <Alert severity="error">
          Please make sure the spreadsheet is an Aspire Budgeting spreadsheet
          and try again
        </Alert>
      ) : null}
      {spreadSheetIdIsValidating ? (
        <Box sx={{ paddingTop: 6, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <SpreadsheetSelector />
      )}
    </Main>
  );
}
