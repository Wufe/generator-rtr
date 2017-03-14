'use strict';

const Generator = require('yeoman-generator');
const ChildProcess = require('child_process');
const Spawn = ChildProcess.spawn;

const isBlank = s => s.match(/^\W*$/) !== null;
const containsWhiteSpaces = s => s.match(/\W/) !== null;

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
    }

    prompting() {
        return this.prompt([{
            message: 'Please input a project name',
            name: 'projectName',
            type: 'input',
            validate: s => !isBlank(s) && !containsWhiteSpaces(s)
        }, {
            message: 'Choose implementation options',
            name: 'components',
            type: 'checkbox',
            choices: [{
                name: 'Sagas',
                value: 'sagas'
            }, {
                name: 'React Router',
                value: 'router'
            }, {
                name: 'Redux Logger (dev only)',
                value: 'logger'
            }, {
                name: 'Redux Immutable State Invariant (dev only)',
                value: 'immutable'
            }]
        }, {
            message: 'Choose webpack configuration',
            name: 'webpack',
            type: 'checkbox',
            choices: [{
                name: 'Babel ( es2015 preset )',
                value: 'babel',
                checked: true
            }, {
                name: 'SASS loader',
                value: 'sass',
                checked: true
            }, {
                name: 'JSON loader',
                value: 'json',
                checked: true
            }, {
                name: '__filename and __dirname resolve',
                value: 'filename',
                checked: true
            }]
        }]).then((answers) => {
            return this._parseAnswers(answers);
        });
    }

    _parseAnswers(answers) {
        if (!answers) {
            return;
        } else {
            this.answers = {
                components: {},
                webpack: {},
                projectName: answers.projectName
            };
            let { components, webpack } = answers;
            for (let i in components) {
                let component = components[i];
                this.answers.components[component] = true;
            }
            for (let i in webpack) {
                let webpackConf = webpack[i];
                this.answers.webpack[webpackConf] = true;
            }
        }
    }

    createPackageJson() {
        this.log('Creating package.json..');
        return this.fs.writeJSON(this.destinationPath('package.json'), {
            name: this.answers.projectName,
            version: '0.0.1',
            description: '',
            scripts: {
                'compile': 'webpack',
                'compile:watch': 'npm run compile -- --watch',
                'compile:prod': 'NODE_ENV=prod npm run compile',
                'compile:prod:watch': 'NODE_ENV=prod npm run compile:watch',
                'start': 'serve .'
            }
        });
    }

    installNpmLibs() {
        const webpackLib = ['webpack', 'source-map-loader', 'bundle-loader'];
        const serveLib = ['serve'];
        const tsLib = ['typescript', 'typings', 'awesome-typescript-loader'];
        const reactLib = ['react', 'react-dom'];
        const reduxLib = ['redux', 'react-redux'];

        const { components, webpack } = this.answers;
        const sagasLib = components.saga ? ['redux-saga'] : [];
        const routerLib = components.router ? ['react-router', 'react-router-redux'] : [];
        const loggerLib = components.logger ? ['redux-logger'] : [];
        const immutableLib = components.immutable ? ['redux-immutable-state-invariant'] : [];
        const sassLib = webpack.sass ? ['style-loader', 'sass-loader', 'css-loader', 'node-sass'] : [];

        const babelLib = webpack.babel ? [
            'babel',
            'babel-core',
            'babel-loader',
            'babel-preset-es2015',
            'babel-preset-stage-0',
            'babel-plugin-syntax-dynamic-import',
            'babel-polyfill'
        ] : [];

        return this.npmInstall([
            ...webpackLib,
            ...serveLib,
            ...tsLib,
            ...reactLib,
            ...reduxLib,
            ...sagasLib,
            ...routerLib,
            ...loggerLib,
            ...immutableLib,
            ...babelLib,
            ...sassLib
        ], { 'save-dev': true });
    }

    createWebpackConfiguration() {
        let tp = this.templatePath();
        let dp = this.destinationPath();
        let { webpack } = this.answers;
        this.fs.writeJSON(this.destinationPath('webpack/config.json'), {
            loaders: {
                typescript: webpack.typescript ? true : false,
                sass: webpack.sass ? true : false,
                json: webpack.json ? true : false,
                babel: webpack.babel ? true : false
            },
            'dirname-filename': webpack.filename ? true : false
        });
        this.fs.copy(`${tp}/webpack/config.js`, `${dp}/webpack/config.js`);
        this.fs.copy(`${tp}/webpack.config.js`, `${dp}/webpack.config.js`);
    }

    createStoreProvider() {
        let { components } = this.answers;
        this.fs.copyTpl(
            this.templatePath('app/StoreProvider.ts'),
            this.destinationPath('app/StoreProvider.ts'), {
                reduxImmutableStateInvariantRequire: components.immutable ?
                    `const reduxImmutableStateInvariant = require('redux-immutable-state-invariant').default;` : ``,
                reduxImmutableStateInvariantMiddlewareComposition: components.immutable ?
                    `reduxImmutableStateInvariant(),` : ``,
                reduxLoggerImport: components.logger ?
                    `import * as Logger from 'redux-logger';` : ``,
                reduxLoggerMiddlewareComposition: components.logger ?
                    `Logger({ collapsed: true }),` : ``,
                reactRouterHistoryImport: components.router ?
                    `import {browserHistory} from '.';` : ``,
                reactRouterReduxSyncHistoryWithStoreImport: components.router ?
                    `import {syncHistoryWithStore} from 'react-router-redux';` : ``,
                reactRouterReduxSyncHistoryWithStoreInvoke: components.router ?
                    `const history = syncHistoryWithStore( browserHistory, store );` : ``,
                reactRouterReduxSyncHistoryWithStoreExport: components.router ?
                    `history,` : ``,
                reduxSagaImport: components.sagas ?
                    `import {default as Saga} from 'redux-saga';` : ``,
                createSagaObject: components.sagas ?
                    `const saga = Saga();` : ``,
                runSaga: components.sagas ?
                    `saga.run( rootSaga );` : ``,
                reduxSagaMiddlewareComposition: components.sagas ?
                    `saga,` : ``,
                rootSagaImport: components.sagas ?
                    `import {root as rootSaga} from './sagas';` : ``
            }
        );
    }

    createHistoryProvider() {
        if (!this.answers.components.router)
            return;
        this.fs.copy(
            this.templatePath('app/HistoryProvider.ts'),
            this.destinationPath('app/HistoryProvider.ts')
        );
    }

    createIndexTs() {
        this.fs.copy(
            this.templatePath('app/index.ts'),
            this.destinationPath('app/index.ts')
        );
    }

    createIndexTsx() {
        let { components } = this.answers;
        this.fs.copyTpl(
            this.templatePath('index.tsx'),
            this.destinationPath('index.tsx'), {
                homeComponentImport: components.router ?
                    `` : `import {Home} from './app/components';`,
                routesImport: components.router ?
                    `import {routes} from './app';` : ``,
                reactRouterBrowserHistoryImport: components.router ?
                    `import {browserHistory} from 'react-router';` : ``,
                reactDomRenderEntrypoint: components.router ?
                    `routes,` : `<Home />,`
            }
        );
    }

    // React-Router region
    createRouteProvider() {
        if (!this.answers.components.router)
            return;
        this.fs.copy(
            this.templatePath('app/RouteProvider.tsx'),
            this.destinationPath('app/RouteProvider.tsx')
        );
    }

    createRouterStructureComponent() {
        if (!this.answers.components.router)
            return;
        this.fs.copyTpl(
            this.templatePath('app/components/structure/index.tsx'),
            this.destinationPath('app/components/structure/index.tsx'), {
                structureStyleImport: this.answers.webpack.sass ?
                    `import './style.scss';` : ``
            }
        );
        if (this.answers.webpack.sass) {
            this.fs.copy(
                this.templatePath('app/components/structure/style.scss'),
                this.destinationPath('app/components/structure/style.scss')
            );
        }
        this.fs.copyTpl(
            this.templatePath('app/components/index.ts'),
            this.destinationPath('app/components/index.ts'), {
                structureComponentExport: this.answers.components.router ? `export {default as Structure} from './structure';` : ``
            }
        );
    }

    createLoaderLib() {
        if (!this.answers.components.router)
            return;
        this.fs.copy(
            this.templatePath('app/lib/index.ts'),
            this.destinationPath('app/lib/index.ts')
        );
        this.fs.copy(
            this.templatePath('app/lib/loader.ts'),
            this.destinationPath('app/lib/loader.ts')
        );
    }

    createHomeComponent() {
        this.fs.copy(
            this.templatePath('app/components/home/index.tsx'),
            this.destinationPath('app/components/home/index.tsx')
        );
    }

    createConstants() {
        this.fs.copy(
            this.templatePath('app/constants/index.ts'),
            this.destinationPath('app/constants/index.ts')
        );
        this.fs.copy(
            this.templatePath('app/constants/ping.ts'),
            this.destinationPath('app/constants/ping.ts')
        );
    }

    createActions() {
        this.fs.copy(
            this.templatePath('app/actions/index.ts'),
            this.destinationPath('app/actions/index.ts')
        );
        this.fs.copy(
            this.templatePath('app/actions/ping.ts'),
            this.destinationPath('app/actions/ping.ts')
        );
    }

    createSagas() {
        if (!this.answers.components.sagas)
            return;
        this.fs.copy(
            this.templatePath('app/sagas/index.ts'),
            this.destinationPath('app/sagas/index.ts')
        );
        this.fs.copy(
            this.templatePath('app/sagas/ping.ts'),
            this.destinationPath('app/sagas/ping.ts')
        );
        this.fs.copy(
            this.templatePath('app/sagas/root.ts'),
            this.destinationPath('app/sagas/root.ts')
        );
    }

    createState() {
        this.fs.copy(
            this.templatePath('app/states/index.ts'),
            this.destinationPath('app/states/index.ts')
        );
        this.fs.copy(
            this.templatePath('app/states/app.ts'),
            this.destinationPath('app/states/app.ts')
        );
        this.fs.copy(
            this.templatePath('app/states/root.ts'),
            this.destinationPath('app/states/root.ts')
        );
    }

    createReducers() {
        let { components } = this.answers;
        this.fs.copy(
            this.templatePath('app/reducers/index.ts'),
            this.destinationPath('app/reducers/index.ts')
        );
        this.fs.copy(
            this.templatePath('app/reducers/app.ts'),
            this.destinationPath('app/reducers/app.ts')
        );
        this.fs.copyTpl(
            this.templatePath('app/reducers/root.ts'),
            this.destinationPath('app/reducers/root.ts'), {
                routingMiddlewareImport: components.router ?
                    `import {routerReducer as routing} from 'react-router-redux';` : ``,
                routingMiddlewareCombine: components.router ?
                    `routing,` : ``
            }
        );
    }

    createIndexHtml() {
        this.fs.copy(
            this.templatePath('index.html'),
            this.destinationPath('index.html')
        );
    }

    createTsConfig() {
        this.fs.copy(
            this.templatePath('tsconfig.json'),
            this.destinationPath('tsconfig.json')
        );
    }

    installDataTypes() {
        const nodeType = ['@types/node'];
        const reactType = ['@types/react', '@types/react-dom'];
        const reduxType = ['@types/redux', '@types/react-redux'];

        const { components } = this.answers;
        const routerType = components.router ? ['@types/react-router', '@types/react-router-redux'] : [];
        const loggerType = components.logger ? ['@types/redux-logger'] : [];
        const sagasType = components.sagas ? ['@types/redux-saga'] : [];
        const immutableType = components.immutable ? ['@types/redux-immutable-state-invariant'] : [];

        return this.npmInstall([
            ...nodeType,
            ...reactType,
            ...reduxType,
            ...routerType,
            ...loggerType,
            ...sagasType,
            ...immutableType
        ]);
    }

    end() {
        this.log('Done!');
        this.log('Run webpack to build, and npm start to start.');
    }

};