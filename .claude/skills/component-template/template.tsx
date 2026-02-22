'use client';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

interface ComponentNameProps {
  // Props を定義
}

const StyledRoot = styled(Box)(({ theme }) => ({
  // スタイルを定義
}));

export const ComponentName = (props: ComponentNameProps) => {
  return (
    <StyledRoot>
      {/* コンテンツ */}
    </StyledRoot>
  );
};
