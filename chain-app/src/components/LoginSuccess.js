import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';

const PageContainer = styled.div`
  background-color: #FBFBFD;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  color: #505F98;
`;

const LeftNav = styled.nav`
  display: flex;
  align-items: center;
`;

const RightNav = styled.nav`
  display: flex;
  align-items: center;
`;

const NavItem = styled(({ as: Component = Link, ...props }) => <Component {...props} />)`
  color: #505F98;
  text-decoration: none;
  margin-left: 1rem;
  transition: opacity 0.3s ease;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  display: inline-block;
  line-height: normal;
  white-space: nowrap;
  vertical-align: middle;
  text-align: center;
  &:hover {
    opacity: 0.7;
  }
  &:focus {
    outline: none;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #505F98;
`;

const WelcomeMessage = styled.h1`
  font-size: 3rem;
  margin-bottom: 2rem;
  background: linear-gradient(45deg, #0A1133, #505F98);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
`;

const NavLinkContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
`;

const NavLink = styled(Link)`
  color: #505F98;
  text-decoration: none;
  font-size: 2rem;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;

  &:hover {
    text-decoration: underline;
  }
`;

const LoginSuccess = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(()=> {
    const userString = sessionStorage.getItem('user');
    if (userString) {
      const userData = JSON.parse(userString);
      setUserId(userData.id);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <PageContainer>
      <Header>
        <LeftNav>
          <NavItem to="/">Home</NavItem>
        </LeftNav>
        <RightNav>
          {isLoggedIn ? (
              <NavItem as="button" onClick={handleLogout}>로그아웃</NavItem>
            ) : (
              <NavItem to="/login">로그인</NavItem>
          )}
        </RightNav>
      </Header>
      <ContentContainer>
        <WelcomeMessage>{userId}님 환영합니다!</WelcomeMessage>
        <NavLinkContainer>
          <NavLink to="/register-transaction">보관 이력 등록하기</NavLink>
          <NavLink to="/update-transaction">접근/폐기 이력 등록하기</NavLink>
          <NavLink to="/view-transaction">이력 조회하기</NavLink>
        </NavLinkContainer>
      </ContentContainer>
    </PageContainer>
  );
};

export default LoginSuccess;