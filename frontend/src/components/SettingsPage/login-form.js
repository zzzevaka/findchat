import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Form, FormGroup, FormControl, ControlLabel, Button, HelpBlock, Col} from 'react-bootstrap';
import API from '../../api';


const api = new API('http://194.67.144.130:8080');

const EMAIL_REGEXP = /^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)@([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)[\\.]([a-zA-Z]{2,9})$/;

export default class LoginForm extends PureComponent {

    static propTypes = {
        oldLogin: PropTypes.string,
    }

    constructor(props) {
        super(props);
        this.state = {
            login: '',
            loginValid: {}
        }
    }

    render() {
        const {loginValid, login} = this.state;
        const submitDisplay = loginValid.status === 'success' ? 'block': 'none';
        return (
            <Form
                onSubmit={this.onSubmit}
                horizontal
            >
                <FormGroup
                    controlId='formLogin'
                    validationState={loginValid.status}
                >
                    <Col componentClass={ControlLabel} sm={2}>
                        Login
                    </Col>
                    <Col sm={8}>
                        <FormControl
                            type='email'
                            value={login}
                            placeholder={this.props.oldLogin}
                            onChange={this.onLoginChange}
                            autoComplete='off'
                        />
                        <FormControl.Feedback />
                        <HelpBlock>{loginValid.text}</HelpBlock>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col smOffset={2} sm={10}>
                        <Button type="submit" bsStyle='success'>
                            Change login
                        </Button>
                    </Col>
                </FormGroup>
            </Form>
        );
    }

    onLoginChange = e => {
        const value = e.target.value.toLowerCase();
        let newState = {
            login: value,
            loginValid: {status: null}
        };
        // validate format
        if (!EMAIL_REGEXP.test(value)) {
            this.setState({
                ...newState,
                loginValid: {status: 'warning'}
            });
        }
        // if value is valid set it without any valid status
        else if (value === this.props.oldLogin) {
            this.setState({
                ...newState,
                loginValid: {status: null}
            });
        }
        else {
            // make server side validation
            this.setState(newState);
            let xhr = api.check_email(value);
            xhr.onreadystatechange = () => {
                if (xhr.readyState !== 4) return;
                // login is valid
                if (xhr.status === 200) {
                    this.setState({
                        loginValid: {status: 'success'}
                    });
                }
                // unexpected error
                else if (xhr.status === 500) {
                    this.setState({
                        loginValid: {
                            status: 'error',
                            text: 'unknown error'
                        }
                    });
                }
                // login is invalid
                else {
                    this.setState({
                        loginValid: {
                            status: 'error',
                            text: JSON.parse(xhr.responseText).error
                        }
                    });
                }
            }
        }
    }

    onSubmit = e => {
        e.preventDefault();
        const {login, loginValid} = this.state;
        if (loginValid.status !== 'success') return;
        this.props.actions.putAuth({login: login});
        this.setState({
            loginValid: {status: null}
        });
    }

}