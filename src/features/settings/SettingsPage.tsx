import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { useStore } from '@nanostores/react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Main from '../../layout/Main';
import { $spreadSheetInfo, dataExport } from './state';
import { $spreadSheetId } from '../sync/state';
import { $currency, $dateFormat, $locale } from '../../core/state';
import { currencyCodes } from '../../core/currencies';
import { localesArray } from '../../core/locales';
import { dateFormats } from '../../core/date-formats';

// to simplify the code, let's just reload the page after change of locale settings
// it doesn't happen often anyway
const reloadPage = () => {
  // give some time for stores to update
  setTimeout(() => {
    window.location.reload();
  }, 500);
};

export default function SettingsPage() {
  const spreadSheetInfo = useStore($spreadSheetInfo);
  const currency = useStore($currency);
  const locale = useStore($locale);
  const dateFormat = useStore($dateFormat);
  const spreadSheetName = spreadSheetInfo?.name;

  return (
    <Main>
      <Card variant="outlined" sx={{ marginBottom: '1em' }}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Spreadsheet
          </Typography>
          <Typography
            variant="body2"
            component="span"
            sx={{ color: 'text.secondary', marginRight: '1em' }}
          >
            {spreadSheetName}
          </Typography>
          {spreadSheetName ? (
            <Button size="small" onClick={() => $spreadSheetId.set('')}>
              Change
            </Button>
          ) : null}
        </CardContent>
      </Card>
      <Card variant="outlined" sx={{ marginBottom: '1em' }}>
        <CardContent sx={{ maxWidth: 500, color: 'text.secondary' }}>
          <Typography gutterBottom variant="h5" component="div">
            Localization
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <label>Language:</label>
            <Autocomplete
              value={localesArray.find((l) => l.key === locale)}
              onChange={(_, newValue) => {
                $locale.set(newValue.key);
                reloadPage();
              }}
              options={localesArray}
              getOptionLabel={(option) => option.value}
              renderInput={(params) => <TextField {...params} size="small" />}
              size="small"
              disableClearable
            />
            <label>Currency:</label>
            <Autocomplete
              value={currency}
              onChange={(_, newValue) => {
                $currency.set(newValue);
                reloadPage();
              }}
              options={currencyCodes}
              renderInput={(params) => <TextField {...params} size="small" />}
              size="small"
              disableClearable
            />
            <label>Date Format:</label>
            <Autocomplete
              value={dateFormat}
              onChange={(_, newValue) => {
                $dateFormat.set(newValue);
                reloadPage();
              }}
              options={dateFormats}
              renderInput={(params) => <TextField {...params} size="small" />}
              size="small"
              disableClearable
            />
          </Box>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Tools
          </Typography>
          <Button size="small" variant="contained" onClick={dataExport}>
            Export
          </Button>
        </CardContent>
      </Card>
    </Main>
  );
}
