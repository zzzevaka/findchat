import express from 'express';
import React from 'react';
import i18next from 'i18next';
import i18nMiddleware from 'i18next-express-middleware';

import { renderToString } from 'react-dom/server';
import {StaticRouter, Switch, Route, matchPath} from 'react-router-dom';
import { renderRoutes, matchRoutes } from 'react-router-config';
import ChatApp from '../frontend/components/ChatApp.react';
import LoginPage from '../frontend/components/LoginPage';

import {routes} from '../frontend/routes';

import configureStore from '../frontend/store/configureStore';
import { Provider } from 'react-redux';

import { I18nextProvider } from 'react-i18next';
import {options as i18n_options } from '../frontend/i18n';

import Router from 'react-router/Router'

const store = configureStore({});

const i18n = i18next
              .use(i18nMiddleware.LanguageDetector)
              .init({
                preload: ['en', 'ru'],
                ...i18n_options
              });

class Test extends React.Component {

  render() {
    return (
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
            <StaticRouter context={{}}>
              <ChatApp>
                {this.props.children}
              </ChatApp>
            </StaticRouter>
          </I18nextProvider>
      </Provider>
    );
  }

}

var app = express();
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
pp.use(i18nMiddleware.handle(i18next, {
  ignoreRoutes: ["/foo"],
  removeLngFromUrl: false
}));

app.get('*', function (req, res) {
  let context = {};
  // const r = matchPath(req.url, rl);
  const branch = matchRoutes(routes, req.url);
  console.log(branch);
  const content = renderToString(
    <Test>
      {branch.map(({route}) => {
        const Component = route.component;
        return <Component />
      })}
    </Test>
  );
  res.render(
    'index',
    {
      title: 'Express',
      data: false,
      content: content
    }
  )
});

app.listen(80, function () {
  console.log('Example app listening on port 80!!');
});