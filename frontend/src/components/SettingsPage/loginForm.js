import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

export default class LoginForm extends PureComponent {

    static propTypes = {
        oldLogin: PropTypes.string
    }

    constructor(props) {
        super(props);
        this.state = {
            inputValue: props.oldLogin || '',
            errMsg: undefined,
            submitDisabled: true
        }
    }


    render() {
        const {inputValue, submitDisabled} = this.state;
        const {oldLogin, ...rest} = this.props;
        return (
            <form style={{
                display: 'flex'
            }}>
            </form>
        )
    }

}