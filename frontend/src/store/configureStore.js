import { createStore, applyMiddleware } from 'redux';
import trunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
    const logger = createLogger();
    return createStore(
        rootReducer,
        initialState,
        applyMiddleware(
            // logger,
            trunk
        )
    );
}
