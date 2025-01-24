import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  color: 505F98;
`;

const NavItem = styled(Link)`
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

const LoginContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #505F98;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 300px;
`;

const InputLabel = styled.label`
  margin-botoom: 0.5rem;
  color: #505F98;
  font-size: 1rem;
`;

const LoginInput = styled.input`
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #505F98;
  background-color: #FBFBFD;
  color: #505F98;
`;

const FormFooter = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 0.3rem;
  background-color: #111B47;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 1px;
  transition: background-color 0.3s ease;
  &:hover {
    opacity: 0.8;
  }
`;

const SignUpLink = styled(Link)`
  color: #505F98;
  text-decoration: none;
  font-size: 1rem;
  transition: opacity 0.3s ease;
  margin-top: 1rem;
  &:hover {
    opacity: 0.7;
  }
`;

const Login = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`api/login`, { id, password });
      const userData = {
        id: response.data.userId,
        publicKey: response.data.publicKey
      };
      sessionStorage.setItem('user', JSON.stringify(userData));
      alert('로그인 성공!');
      navigate('/login-success');
    } catch (error) {
      console.error('Error:', error);
      alert(`로그인 실패: ${error.response?.data?.message || 'An error occurred'}`);
    }
  };

  return (
    <PageContainer>
      <Header>
        <nav>
          <NavItem to="/">Home</NavItem>
        </nav>
      </Header>
      <LoginContainer>
        <LoginForm onSubmit={handleSubmit}>
          <InputLabel htmlFor='id'>아이디</InputLabel>
          <LoginInput 
            type="text" 
            placeholder="ID" 
            required 
            value={id} 
            onChange={(e) => setId(e.target.value)}
          />
          <InputLabel htmlFor='password'>비밀번호</InputLabel>
          <LoginInput 
            type="password" 
            placeholder="Password" 
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormFooter>
            <LoginButton type="submit">로그인</LoginButton>
            <SignUpLink to="/signup">등록하기</SignUpLink>
          </FormFooter>
        </LoginForm>
      </LoginContainer>
    </PageContainer>
  );
};

export default Login;