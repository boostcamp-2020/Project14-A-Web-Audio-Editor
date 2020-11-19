import React, { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { App } from '../shared';
import GlobalStyle from './GlobalStyle';
import theme from './Theme';
import { ThemeProvider } from './ThemeComponents';

const Root = (): ReactElement => {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default Root;
