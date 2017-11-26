import React, {PureComponent} from 'react';


export default class SimpleForm extends PureComponent {

    render() {
        return (
            <form>
                {this.props.children}
            </form>
        )
    }

}