import Box, { BoxProps } from '@mui/material/Box';
import SearchAppBar from './AppBar';

export default function Main({
  children,
  appBarChildren,
  mainProps,
}: {
  children: React.ReactNode;
  appBarChildren?: React.ReactNode;
  mainProps?: BoxProps;
}) {
  return (
    <Box flexGrow={1}>
      {appBarChildren ? <SearchAppBar>{appBarChildren}</SearchAppBar> : null}
      <Box
        component="main"
        flexGrow={1}
        height={appBarChildren ? 'calc(100vh - 69px)' : '100vh'}
        overflow="auto"
        padding="16px"
        {...mainProps}
        sx={{
          backgroundColor: 'background.default',
          ...mainProps?.sx,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
