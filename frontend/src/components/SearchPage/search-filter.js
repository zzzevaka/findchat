import React, {Component} from 'react';
import Select, {Creatable} from 'react-select';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../actions';

const MAX_VALUES = 4;

class SearchFiler extends Component {

    shouldOptionCreate({keyCode}) {
        return [13,62].indexOf(keyCode) !== -1;
    }

    onChange = (values) => {
        const {actions} = this.props;
        if (values.split(',').length > MAX_VALUES) return;
        actions.updateSearchFilter({
            tags: values ? values.split(',').map(v => v.toLowerCase()) : []
        });
    }

    getInputProps() {
        return {
            disabled: this.props.filter.tags.length >= MAX_VALUES
        };
    }

    render() {

        const {filter, actions} = this.props;
        const selectFilter = filter.tags.map(v => ({label: v, value: v}));

        return (
            <Creatable
                className='search-input'
                value={selectFilter}
                placeholder={<img src='/svg/search_color.svg' />}
                onChange={this.onChange}
                shouldKeyDownEventCreateNewOption={this.shouldOptionCreate}
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