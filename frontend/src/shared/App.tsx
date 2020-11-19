import React, { ReactElement } from 'react';
import { Route, Switch } from 'react-router-dom';
import { LoginPage, MainPage } from '../pages';

const App = (): ReactElement => {
  return (
    <Switch>
      <Route exact path="/login" component={LoginPage} />
      <Route exact path="/" component={MainPage} />
    </Switch>
  );
};

export default App;
