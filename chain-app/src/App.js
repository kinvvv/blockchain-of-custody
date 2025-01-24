import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Route, Link, Routes, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import LoginSuccess from './components/LoginSuccess';
import ProtectedRoute from './components/ProtectedRoute'
import ViewTransactionOptions from './components/ViewTransactionOptions';
import SearchTransaction from './components/SearchTransaction';
import TransactionResult from './components/TransactionResult';
import RegisterTransaction from './components/RegisterTransaction';
import UpdateTransaction from './components/UpdateTransaction'
import ViewMyTransactions from './components/ViewMyTransactions';

const PageContainer = styled.div`
  background-color: #FBFBFB;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #FBFBFD;
  color: white;
`;

const CenterNav = styled.nav`
  display: flex;
  gap: 2rem;
`;

const RightNav = styled.nav`
  display: flex;
  justify-content: right;
`;

const NavItem = styled(({as: Component = Link, ...props}) => <Component {...props} />)`
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

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #FBFBFD;
  padding-bottom: 10%;
`;

const ContentContainer = styled.div`
  max-width: 800px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 5rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #0A1133, #505F98);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: #transparent;
`;

const TitleLine = styled.span`
  display: block;
  text-align: left;
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  text-align: right;
  color: #505F98;
  margin-top: 1rem;
  line-height: 1.5;
`;

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(()=> {
    const user = sessionStorage.getItem('user');
    setIsLoggedIn(!!user);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <PageContainer>
      <Header>
        <CenterNav>
          <NavItem to="/register-transaction">보관 이력 등록하기</NavItem>
          <NavItem to="/update-transaction">접근/폐기 이력 등록하기</NavItem>
          <NavItem to="/view-transaction">이력 조회하기</NavItem>
        </CenterNav>
        <RightNav>
          {isLoggedIn ? (
            <NavItem as="button" onClick={handleLogout}>로그아웃</NavItem>
          ) : (
            <NavItem to="/login">로그인</NavItem>
          )}
        </RightNav>
      </Header>
      <MainContent>
        <ContentContainer>
          <Title>
            <TitleLine>Digital Forensic</TitleLine>
            <TitleLine>Transaction System</TitleLine>
          </Title>
          <Subtitle>
            based on Sawtooth
          </Subtitle>
        </ContentContainer>
      </MainContent>
    </PageContainer>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/register-transaction" element={
          <ProtectedRoute>
            <RegisterTransaction />
          </ProtectedRoute> 
        } />
        <Route path="/update-transaction" element={
          <ProtectedRoute>
            <UpdateTransaction />
          </ProtectedRoute>
        } />
        <Route path="/view-my-transactions" element={
          <ProtectedRoute>
            <ViewMyTransactions />
          </ProtectedRoute>
        } />
        <Route path="/view-transaction" element={<ViewTransactionOptions />} />
        <Route path="/search-transaction" element={<SearchTransaction />} />
        <Route path="/search-transaction/:addressParam" element={<SearchTransaction />} />
        <Route path="/transaction-result" element={<TransactionResult />} />
      </Routes>
    </Router>
  )
}

export default App;