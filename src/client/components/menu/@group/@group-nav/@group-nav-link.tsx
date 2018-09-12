import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {styled} from 'theme';

const Wrapper = styled.div``;

export interface GroupNavLinkProps {
    className?: string;
}

@observer
export class GroupNavLink extends Component<GroupNavLinkProps> {
    render(): ReactNode {
        let {className} = this.props;

        return (
            <Wrapper className={classNames('group-nav-link', className)}>
                GroupNavLink
            </Wrapper>
        );
    }

    static Wrapper = Wrapper;
}
