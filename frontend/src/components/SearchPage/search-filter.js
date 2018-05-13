import React, {Component} from 'react';
import {Creatable} from 'react-select';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import {parseHistorySearch} from '../../utils';

const MAX_VALUES = 1;

class SearchFiler extends Component {

    componentDidMount() {
        this.getTagsFromURL();
    }

    componentDidUpdate(pProps) {
        if (this.props.location !== pProps.location) {
            this.getTagsFromURL();
        }
    }

    getTagsFromURL() {
        const {history, filter, actions} = this.props;
        const tag = parseHistorySearch(history)['tags'];
        if (!tag) return;
        if (filter.tags.indexOf(tag) === -1) {
            actions.updateSearchFilter({
                tags: [tag]
            });
        }
    }

    shouldOptionCreate({keyCode}) {
        return [13,62].indexOf(keyCode) !== -1;
    }

    onChange = (values) => {
        const {actions} = this.props;
        if (values.split(',').length > MAX_VALUES) return;
        actions.updateSearchFilter({
            tags: values ? values.split(',').map(v => v) : []
        });
    };

    getInputProps() {
        return {
            disabled: this.props.filter.tags.length >= MAX_VALUES
        };
    }

    onInputChange = value => {
        return value
        // return value.replace(/ /g, '_').toLowerCase();
    };

    render() {
        const {filter} = this.props;
        const selectFilter = filter.tags.map(v => ({label: v, value: v}));
        return (
            <Creatable
                options={[]}
                className='search-input'
                value={selectFilter}
                placeholder={<img src='/svg/search_color.svg' alt="search"/>}
                onChange={this.onChange}
                shouldKeyDownEventCreateNewOption={this.shouldOptionCreate}
                onInputChange={this.onInputChange}
                menuRenderer={() => {}}
                inputProps={this.getInputProps()}
                noResultsText=''
                simpleValue
                multi
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        filter: state.searchFilter
    }
}

function mapActionsToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

export default connect(mapStateToProps, mapActionsToProps)(SearchFiler);