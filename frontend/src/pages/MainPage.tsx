import React, { ReactElement } from 'react';
import styled from 'styled-components';

const BodyWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  ${({ theme }) => theme.media.tablet`
    flex-direction: column;
    justify-content: center;
  `}
`;

const MainPage = (): ReactElement => {
  return (
    <BodyWrapper>
      <h1>메인페이지입니다</h1>
    </BodyWrapper>
  );
};

export default MainPage;
