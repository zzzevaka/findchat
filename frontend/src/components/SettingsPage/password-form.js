import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Form, FormGroup, FormControl, ControlLabel, Button, HelpBlock, Col} from 'react-bootstrap';
import API from '../../api';


const api = new API('http://194.67.144.130:8080');

const PWD_SPEC_CHAR = '!@#$%^&*';
const PWD_REGEXEP = new RegExp(`^[\\w${PWD_SPEC_CHAR}]+$`);
const MIN_PWD_LENGTH = 4;
const MAX_PWD_LENGTH = 40;

export default class PasswordForm extends PureComponent {

    constructor() {
        super();
        this.state = {
            pwd: '',
            rptPwd: '',
            pwdValid: {},
            rptPwdValid: {},
        };
    }

    render() {
        const {pwd, rptPwd, pwdValid, rptPwdValid} = this.state;
        let submitDisplay = 'none';
        if (pwdValid.status === 'success' && rptPwdValid.status === 'success') {
            submitDisplay = 'block';
        }
        return (
            <Form
                onSubmit={this.onSubmit}
                horizontal
                style={{
                    maxWidth: '600px',
                    padding: '4px',
                    margin: '10px 0',
                    border: '1px solid black'
                }}
            >
                <FormGroup
                    controlId='pwd'
                    validationState={pwdValid.status}
                    style={{maxWidth: '600px', padding: '4px'}}
                >
                    <Col componentClass={ControlLabel} sm={2}>
                        New password
                    </Col>
                    <Col sm={8}>
                        <FormControl
                            type='password'
                            value={pwd}
                            onChange={this.onPwdChange}
                        />
                        <FormControl.Feedback />
                        <HelpBlock>{pwdValid.text}</HelpBlock>
                    </Col>
                </FormGroup>
                <FormGroup
                    controlId='rptPwd'
                    validationState={rptPwdValid.status}
                    style={{maxWidth: '600px', padding: '4px'}}
                >
                    <Col componentClass={ControlLabel} sm={2}>
                        Repeat password
                    </Col>
                    <Col sm={8}>
                        <FormControl
                            type='password'
                            value={rptPwd}
                            onChange={this.onRptPwdChange}
                        />
                        <FormControl.Feedback />
                    </Col>
                </FormGroup>
                <FormGroup
                    style={{
                        maxWidth: '600px',
                        padding: '4px',
                        display: submitDisplay
                    }}
                >
                    <Col smOffset={2} sm={10}>
                        <Button type="submit" bsStyle='success'>
                            Change password
                        </Button>
                    </Col>
                </FormGroup>
            </Form>
        )
    }

    onPwdChange = ({target: {value}}) => {
        let newState = {pwd: value};
        if (!value) {
            this.setState({
                ...newState,
                pwdValid: {}
            });
        }
        else if (value.length < MIN_PWD_LENGTH || value.length > MAX_PWD_LENGTH) {
            this.setState({
                ...newState,
                pwdValid: {
                    status: 'warning',
                    text: `password length must be between ${MIN_PWD_LENGTH} and ${MAX_PWD_LENGTH}` 
                }
            });
        }
        else if (PWD_REGEXEP.test(value)) {
            this.setState({
                ...newState,
                pwdValid: {status: 'success'}
            });
        }
        else {
            this.setState({
                ...newState,
                pwdValid: {
                    status: 'warning',
                    text: 'Password contains incorrent symbols'
                }
            });
        }
    }

    onRptPwdChange = ({target: {value}}) => {
        const newState = {rptPwd: value};
        if (!value) {
            this.setState({
                ...newState,
                pwdValid: {}
            });
        }
        else if (value === this.state.pwd) {
            this.setState({
                ...newState,
                rptPwdValid: {status: 'success'}
            });
        }
        else {
            this.setState({
                ...newState,
                rptPwdValid: {status: 'warning'}
            });
        }
    }

    onSubmit = e => {
        e.preventDefault();
        const {pwd, pwdValid, rptPwdValid} = this.state;
        if (pwdValid.status !== 'success' || rptPwdValid.status !== 'success') return;
        this.props.actions.putAuth({password: pwd});
        this.setState({
            pwd: '',
            rptPwd: '',
            pwdValid: {},
            rptPwdValid: {}
        });
    }

}