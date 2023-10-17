import Typography from '@mui/material/Typography';
import Main from './Main';

export default function NotFound() {
  return (
    <Main mainProps={{ sx: { paddingTop: 6 } }}>
      <Typography variant="h3" textAlign="center">
        NotFound
      </Typography>
    </Main>
  );
}
