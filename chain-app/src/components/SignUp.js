// src/components/SignUp.js
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
  color: #505F98;
`;

const NavItem = styled(Link)`
  color: #505F98;
  text-decoration: none;
  margin-left: 1rem;
  transition: opacity 0.3s ease;
  font-size: 1.5rem;
  &:hover {
    opacity: 0.7;
  }
`;

const LeftNav = styled.nav`
  display: flex;
  align-items: center;
`;

const RightNav = styled.nav`
  display: flex;
  align-items: center;
`;

const SignUpContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #505F98;
`;

const SignUpForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 300px;
`;

const InputLabel = styled.label`
  margin-botoom: 0.5rem;
  color: #505F98;
  font-size: 1rem;
`;

const SignUpInput = styled.input`
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #505F98;
  background-color: #FBFBFD;
  color: #505F98;
`;

const SignUpButton = styled.button`
  padding: 0.5rem;
  background-color: #111B47;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 1px;
  transition: background-color 0.3s ease;
  &:hover {
    opacity: 0.8;
  }
`;

const SignUp = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    try {
      const response = await axios.post(`/api/signup`, { id, password });
      alert('등록 성공! 로그인해주세요');
      navigate('/login')
    } catch (error) {
      console.error('Error:', error);
      alert(`등록 실패: ${error.response?.data?.messgae || 'An error occurred'}`);
    }
  };

  return (
    <PageContainer>
      <Header>
        <LeftNav>
          <NavItem to="/">Home</NavItem>
        </LeftNav>
        <RightNav>
          <NavItem to="/login">로그인</NavItem>
        </RightNav>
      </Header>
      <SignUpContainer>
        <SignUpForm onSubmit={handleSubmit}>
          <InputLabel htmlFor='id'>아이디</InputLabel>
          <SignUpInput 
            type="text" 
            placeholder="ID" 
            required 
            value={id} 
            onChange={(e) => setId(e.target.value)}
          />
          <InputLabel htmlFor='password'>비밀번호</InputLabel>
          <SignUpInput 
            type="password" 
            placeholder="Password" 
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputLabel htmlFor='password'>비밀번호 확인</InputLabel>
          <SignUpInput 
            type="password" 
            placeholder="Confirm Password" 
            required 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <SignUpButton type="submit">등록하기</SignUpButton>
        </SignUpForm>
      </SignUpContainer>
    </PageContainer>
  );
};

export default SignUp;