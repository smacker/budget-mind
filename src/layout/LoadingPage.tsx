import CircularProgress from '@mui/material/CircularProgress';
import Main from './Main';

export default function LoadingPage() {
  return (
    <Main mainProps={{ sx: { paddingTop: 6, textAlign: 'center' } }}>
      <CircularProgress />
    </Main>
  );
}
