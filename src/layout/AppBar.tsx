import Box from '@mui/material/Box';

export default function AppBar({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexGrow: 1,
        padding: '10px 24px',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider',
        bgcolor: 'background.default',
        alignItems: 'center',
        height: '68px',
      }}
    >
      <Box sx={{ flexGrow: 1 }}>{children}</Box>
    </Box>
  );
}
