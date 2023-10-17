import Box from '@mui/material/Box';

export default function AppBar({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexGrow: 1,
        padding: '10px 24px',
        borderBottom: '1px solid #F0F0F0',
        bgcolor: '#fff',
        alignItems: 'center',
        height: '68px',
      }}
    >
      <Box sx={{ flexGrow: 1 }}>{children}</Box>
    </Box>
  );
}
