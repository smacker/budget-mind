import { Typography } from '@mui/material';
import { useStore } from '@nanostores/react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Main from '../../layout/Main';
import { $spreadSheetInfo } from './state';
import { $spreadSheetId } from '../sync/state';

export default function SettingsPage() {
  const spreadSheetInfo = useStore($spreadSheetInfo);
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
      <Card variant="outlined">
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Localization
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Language: English
            <br />
            Currency: USD
            <br />
            Date Format: DD/MM/YYYY
          </Typography>
        </CardContent>
      </Card>
    </Main>
  );
}
