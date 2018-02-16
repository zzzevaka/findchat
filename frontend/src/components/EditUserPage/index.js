import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { translate } from 'react-i18next';
import {Grid, Row, Col, FormGroup, ControlLabel, FormControl, Radio} from 'react-bootstrap';
import MainMenu, {MobileMenu} from '../Menu';
import {MarsIcon, VenusIcon} from '../Icons';
import {TopFixedBarDummy} from '../TopFixedBar';
import {loadUsers, updateUser} from '../../actions';
import API from '../../api';

import './edit-user-page.css';

const api = new API('/api_v1');

class EditUserPage extends Component {

    constructor() {
        super();
        this.state = this.getDefaultState();
    }

    componentDidMount() {
        const {user, dispatch, auth} = this.props;
        if (!user) {
            dispatch(
                loadUsers(auth.user_id)
            );
        }
    }

    getDefaultState = () => ({form: {}, edited: false})

    _inputChange = ({target: {name, value}}) => {
        this.setState({
            form: {
                ...this.state.form,
                [name]: value || null
            },
            edited: true
        })
    }

    _birthChange = v => this.setState({
        form: {
            ...this.state.form,
            birth_date: v.toISOString().split('.')[0]
        },
        edited: true
        
    })

    _laguagesChange = v => this.setState({
        form: {
            ...this.state.form,
            lang: v.split(',')
        },
        edited: true
    })

    _onSubmit = e => {
        e.preventDefault();
        this.props.dispatch(
            updateUser(
                this.state.form,
                () => this.setState(this.getDefaultState())
            )
        ).then(
            () => this.setState(this.getDefaultState())
        )
    }

    render() {
        const {user, t} = this.props;
        const { form, edited } = this.state;
        if (!user) return null;
        return (
            <div className='edit-user-page'>
                <MobileMenu />
                <Grid fluid className='edit-user-page-grid main-container'>
                    <Row>
                        <Col sm={2} className='col-menu'>
                            <MainMenu />
                        </Col>
                        <Col sm={8} className='col-settings'>
                            <div className='settings-container'>
                                <form
                                    onSubmit={this._onSubmit}
                                >
                                    <center>
                                        <UsernameFormGroup
                                            placeholder={user.firstname}
                                            onChange={this._inputChange}
                                            value={form.firstname || ''}
                                            t={t}
                                        />
                                        <hr />
                                        <BirthDateFormGroup
                                            value={new Date(form.birth_date || user.birth_date)}
                                            onChange={this._birthChange}
                                            t={t}
                                        />
                                        <hr />
                                        <GenderFormGroup
                                            value={form.gender || user.gender}
                                            onChange={this._inputChange}
                                            t={t}
                                        />
                                        <hr />
                                        <LanguagesFormGroup
                                            value={form.lang || user.lang}
                                            onChange={this._laguagesChange}
                                            t={t}
                                        />
                                        <hr />
                                        <AboutFormGroup
                                            placeholder={user.about}
                                            onChange={this._inputChange}
                                            value={form.about}
                                            t={t}
                                        />
                                        <hr />
                                        <br />
                                        <button
                                            className='button-no-style button-submit'
                                            disabled={!edited}
                                        >
                                            {t("Submit")}
                                        </button>
                                    </center>
                                </form>
                            </div>
                        </Col>
                    </Row>
                </Grid>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        auth: state.auth,
        user: state.users[state.auth.user_id],
        dispatch: state.dispatch
    };
}

EditUserPage = translate("translations")(EditUserPage);

export default connect(mapStateToProps)(EditUserPage);

class LanguagesFormGroup extends Component {

    constructor() {
        super();
        this.state = {};
    }

    componentDidMount() {
        api.getLanguages().then(
            r => r.json()
        ).then(
            j => this.setState({
                options: j.map(l => ({value: l.name, label: `${l.name} (${l.native_name})`}))
            })
        )
    }

    _onInputChange = v => v.startsWith(' ') ? '' : v

    render() {
        const {options} = this.state;
        if (!options) return null;
        const {value, onChange, t} = this.props;
        return (
                <FormGroup>
                    <ControlLabel>{t("Languages you want to talk in")}:</ControlLabel>
                    <Select
                        className='search-input'
                        placeholder=''
                        value={value}
                        options={options}
                        onChange={onChange}
                        onInputChange={this._onInputChange}
                        inputProps1={{ readOnly: 'readonly' }}
                        simpleValue
                        multi
                    />
                </FormGroup>
        );
    }

}


class UsernameFormGroup extends Component {

    render() {
        const {value, onChange, placeholder, t} = this.props;
        return (
                <FormGroup className='input-round'>
                    <ControlLabel>{t("Your name")}:</ControlLabel>
                    <FormControl
                        name='firstname'
                        type="text"
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        autoComplete='off'
                    />
                    <FormControl.Feedback />
                </FormGroup>
        );
    }

}


class AboutFormGroup extends Component {

    render() {
        const {
            value, placeholder, onChange, t
        } = this.props;
        return (
                <FormGroup className='input-round'>
                    <ControlLabel>{t("Few words about you")}:</ControlLabel>
                    <FormControl
                        name='about'
                        componentClass="textarea"
                        value={value}
                        placeholder={placeholder}
                        onChange={onChange}
                        autoComplete='off'
                    />
                </FormGroup>
        );
    }

}

class GenderFormGroup extends Component {

    render() {
        const {
            value, onChange, t
        } = this.props;
        return (
                <FormGroup className='form-group-inline' onChange={onChange}>
                    <ControlLabel>{t('Gender')}:</ControlLabel>
                    <Radio
                        name="gender"
                        value='male'
                        defaultChecked={value === 'male'}
                        inline
                    >
                        <MarsIcon className='icon-gender icon-mars' />
                    </Radio>
                    <Radio
                        name="gender"
                        value='female'
                        defaultChecked={value === 'female'}
                        inline
                    >
                        <VenusIcon className='icon-gender icon-venus' />
                    </Radio>
                </FormGroup>
        );
    }

}


class BirthDateFormGroup extends Component {

    render() {
        const {
            value, onChange, t
        } = this.props;
        return (
                <FormGroup>
                    <ControlLabel>{t('Birth date')}:</ControlLabel>
                    <DateSelect
                        value={value}
                        onChange={onChange}
                    />
                </FormGroup>
        );
    }

}


class DateSelect extends Component {

    static propTypes = {
        minYear: PropTypes.number.isRequired,
        maxYear: PropTypes.number.isRequired,
        onChange: PropTypes.func,
        value: PropTypes.instanceOf(Date).isRequired
    }

    static defaultProps = {
        minYear: 1900,
        maxYear: new Date().getFullYear(),
        value: new Date(),
        onChange: () => {}
    }

    static months = [
        {value: 0, label: 'January'},
        {value: 1, label: 'February'},
        {value: 2, label: 'March'},
        {value: 3, label: 'April'},
        {value: 4, label: 'May'},
        {value: 5, label: 'June'},
        {value: 6, label: 'July'},
        {value: 7, label: 'August'},
        {value: 8, label: 'September'},
        {value: 9, label: 'October'},
        {value: 10, label: 'November'},
        {value: 11, label: 'December'}
    ];

    static days = [];

    constructor(props) {
        super(props);
        const {minYear, maxYear} = this.props;
        this.years = [];
        for (let i=minYear;i<=maxYear;i++) {
            this.years.push(
                {value: i, label: i}
            );
        }
        this.days = [];
        for (let i=1;i<=31;i++) {
            this.days.push(
                {value: i, label: i}
            );
        }
        
    }

    _getMaxMonthDay(y, m) {
        return  new Date(y, m +1, 0).getDate();
    }

    _onChange(y, m, d) {
        let newDate = new Date(this.props.value);
        if (y) newDate.setYear(y);
        if (m) newDate.setMonth(m);
        if (d) newDate.setDate(d);
        this.props.onChange(newDate);
    }

    render() {
        const {
            value,
            onChange,
            minYear,
            maxYear,
            ...rest
        } = this.props;
        const maxDay = this._getMaxMonthDay(
            value.getFullYear(),
            value.getMonth()
        );
        return (
            <div className='date-select' {...rest}>
                <Select
                    options={this.years}
                    value={value.getFullYear()}
                    simpleValue
                    className="select-year"
                    onChange={(v) => {this._onChange(v, null, null)}}
                    placeholder='Year'
                    clearable={false}
                    autoBlur
                    inputProps={{ readOnly: 'readonly' }}
                />
                <Select
                    options={DateSelect.months}
                    value={value.getMonth()}
                    simpleValue
                    className="select-month"
                    placeholder='Month'
                    clearable={false}
                    onChange={(v) => {this._onChange(null, v, null)}}
                    autoBlur
                    inputProps={{ readOnly: 'readonly' }}
                />
                <Select
                    options={this.days.slice(0, maxDay)}
                    value={value.getDate()}
                    simpleValue
                    className="select-day"
                    placeholder='Day'
                    clearable={false}
                    onChange={(v) => {this._onChange(null, null, v)}}
                    autoBlur
                    inputProps={{ readOnly: 'readonly' }}
                />
            </div>
        )
    }

}


let EditUserTopFixedBar = function({t}) {
    return (
        <TopFixedBarDummy>
            <div style={{
                display: 'flex',
                width: '100%',
                height: '100%',
            }}>
                <p style={{margin: 'auto'}}>{t('Edit profile')}</p>
            </div>
        </TopFixedBarDummy>
    );
}

EditUserTopFixedBar = translate("translations")(EditUserTopFixedBar);

export {EditUserTopFixedBar};