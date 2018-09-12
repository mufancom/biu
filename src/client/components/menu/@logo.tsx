import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';
import {styled} from 'theme';

const Wrapper = styled.div``;

export interface LogoProps {
    className?: string;
}

@observer
export class Logo extends Component<LogoProps> {
    render(): ReactNode {
        let {className} = this.props;

        return (
            <Wrapper className={classNames('@logo', className)}>
                Logo
            </Wrapper>
        );
    }

    static Wrapper = Wrapper;
}
