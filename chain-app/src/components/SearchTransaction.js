import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
  align-items: center;
  padding: 2rem;
  color: #505F98;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(45deg, #0A1133, #505F98);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 550px;
`;

const Input = styled.input`
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #FBFBFD;
  border: 1px solid #505F98;
  color: #505F98;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #111B47;
  color: white;
  border: none;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
`;

const Th = styled.th`
  background-color: #F0F3FA;
  color: #0A1133;
  padding: 0.5rem;
  text-align: left;
  border: 1px solid #D0D9F6;
`;

const Td = styled.td`
  padding: 0.5rem;
  border: 1px solid #D0D9F6;
  color: #505F98;
`;

const SearchTransaction = () => {
  const [address, setAddress] = useState('');
  const [transactionData, setTransactionData] = useState([]);
  const { addressParam } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (addressParam) {
      setAddress(addressParam);
      handleSearch(addressParam);
    }
  }, [addressParam]);

  const handleSearch = async (searchAddress) => {
    try {
      const response = await axios.get(`/api/search-transaction/${searchAddress}`);
      if (response.data && response.data.entries) {
        setTransactionData(response.data);
      } else {
        setTransactionData(null);
        alert('고유 주소에 대한 이력을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      alert('이력 데이터를 가져오는데 실패했습니다.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(address);
  }
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
        <Title>주소로 이력 조회하기</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="조회할 주소를 입력하세요"
          />
          <Button type="submit">조회하기</Button>
        </Form>
        {transactionData && transactionData.entries && transactionData.entries.length > 0 && (
          <Table>
            <thead>
              <tr>
                <Th>순번</Th>
                <Th>상태</Th>
                <Th>등록 시간</Th>
                <Th>확인자</Th>
                <Th>이미지 파일 이름</Th>
                <Th>이미지 해시값</Th>
                <Th>등록 ID</Th>
              </tr>
            </thead>
          <tbody>
            {transactionData.entries.map((entry, index) => (
              <tr key={index}>
                <Td>{index + 1}</Td>
                <Td>{entry.status}</Td>
                <Td>{entry.registrationTime}</Td>
                <Td>{entry.checkerName}</Td>
                <Td>{entry.imageFileName}</Td>
                <Td>{entry.imageHash}</Td>
                <Td>{entry.userId}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default SearchTransaction;