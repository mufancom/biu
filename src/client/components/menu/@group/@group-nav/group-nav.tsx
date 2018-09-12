import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {styled} from 'theme';

const Wrapper = styled.div``;

export interface GroupNavProps {
    className?: string;
}

@observer
export class GroupNav extends Component<GroupNavProps> {
    render(): ReactNode {
        let {className} = this.props;

        return (
            <Wrapper className={classNames('group-nav', className)}>
                GroupNav
            </Wrapper>
        );
    }

    static Wrapper = Wrapper;
}
