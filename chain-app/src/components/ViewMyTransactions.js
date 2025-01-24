import React, { useEffect, useState } from 'react';
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

const LeftNav = styled.nav`
  display: flex;
  align-items: center;
`;

const RightNav = styled.nav`
  display: flex;
  align-items: center;
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

const ContentContainer = styled.div`
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

const TransactionList = styled.ul`
  list-style-type: none;
  padding: 0;
  width: 100%;
  max-width: 1000px;
`;

const StatusBox = styled.span`
  background-color: ${props => props.isSubItem ? '#7885B5' : '#505F98'};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-right: 1rem;
`;

const TransactionItem = styled.li`
  background-color: #fff;
  border: 1px solid #ddd;
  margin-bottom: 1rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f0f0f0;
  }

  ${props => props.isSubItem && `
    margin-left: 2rem;
    border-left: 3px solid #7885B5;
  `}
`;

const TransactionInfo = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
`;

const LoadingSpinner = styled.div`
  border: 5px solid #f3f3f3;
  border-top: 5px solid #505F98;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ViewMyTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const userDataString = sessionStorage.getItem('user');
        if (!userDataString) {
          throw new Error('로그인해주세요');
        }

        const userData = JSON.parse(userDataString);
        const {id: userId, publicKey: pubKey } = userData;

        if (!userId || !pubKey) {
          throw new Error('사용자 인증 정보가 없습니다. 다시 로그인해주세요');
        }

        const response = await axios.get(`http://localhost:5000/api/my-transactions`, { 
          params: {pubKey},
          headers: {'Authorization': `Bearer ${userId}`}
        });

        const groupedTransactions = response.data.reduce((acc, transaction) => {
          if (!acc[transaction.caseNum]) {
            acc[transaction.caseNum] = [];
          }
          acc[transaction.caseNum].push(transaction);
          return acc;
        }, {});

        const sortedTransactions = Object.entries(groupedTransactions)
          .sort(([, a], [, b]) => new Date(b[0].registrationTime) - new Date(a[0].registrationTime))
          .flatMap(([, group]) => 
            group.sort((a, b) => new Date(b.registrationTime) - new Date(a.registrationTime))
          );

        setTransactions(sortedTransactions);
        setLoading(false);
      } catch (err) {
        console.error('이력 조회 중 오류 발생', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleTransactionClick = (transactionId) => {
    navigate(`/transaction/${transactionId}`);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('pubKey');
    navigate('/login');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <PageContainer>
      <Header>
        <LeftNav>
          <NavItem to="/">Home</NavItem>
        </LeftNav>
        <RightNav>
          <NavItem as="button" onClick={handleLogout}>로그아웃</NavItem>
        </RightNav>
      </Header>
      <ContentContainer>
        <Title>등록한 이력 조회</Title>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div>오류: {error}</div>
        ) : (
          <TransactionList>
            {transactions.map((transaction, index) => {
              const isSubItem = index > 0 && transaction.caseNum === transactions[index-1].caseNum;
              return (
                <TransactionItem 
                  key={transaction.transactionId} 
                  onClick={() => handleTransactionClick(transaction.transactionId)}
                  isSubItem={isSubItem}
                >
                  <StatusBox isSubItem={isSubItem}>{transaction.status}</StatusBox>
                  <TransactionInfo>
                    <span>{transaction.caseNum}</span>
                    <span>{transaction.imageFileName}</span>
                    <span>{transaction.deviceType}</span>
                    <span>{new Date(transaction.registrationTime).toLocaleString()}</span>
                  </TransactionInfo>
                </TransactionItem>
              );
            })}
          </TransactionList>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default ViewMyTransactions;