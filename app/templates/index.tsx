declare let require: any;
require("babel-core/register");
require("babel-polyfill");
import * as React from 'react';
import {Component} from 'react';
import {render as DOMRender, unmountComponentAtNode} from 'react-dom';
<%- homeComponentImport %> // import {Home} from './app/components';
<%- routesImport %> // import {routes} from './app';

<%- reactRouterBrowserHistoryImport %> // import {browserHistory} from 'react-router';

// 'app' is the ID of the mount-point
const appRoot = document.getElementById( 'app' ); 

DOMRender(
    <%= reactDomRenderEntrypoint %> // <Provider store={store} children={routes} />, OR <Provider store={store} children={Home} />,
    appRoot
);