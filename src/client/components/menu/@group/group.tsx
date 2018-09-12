import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {styled} from 'theme';

const Wrapper = styled.div``;

export interface GroupProps {
    className?: string;
}

@observer
export class Group extends Component<GroupProps> {
    render(): ReactNode {
        let {className} = this.props;

        return (
            <Wrapper className={classNames('group', className)}>
                Group
            </Wrapper>
        );
    }

    static Wrapper = Wrapper;
}
