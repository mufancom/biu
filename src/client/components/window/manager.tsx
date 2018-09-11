import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {styled} from 'theme';

const Wrapper = styled.div``;

export interface ManagerProps {
    className?: string;
}

@observer
export class Manager extends Component<ManagerProps> {
    render(): ReactNode {
        let {className} = this.props;

        return (
            <Wrapper className={classNames('manager', className)}>
                Manager
            </Wrapper>
        );
    }

    static Wrapper = Wrapper;
}
