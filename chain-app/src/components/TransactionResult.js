import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';
import axios from 'axios';
import CryptoJS from 'crypto-js';

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
  display:flex;
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

const Table = styled.table`
  width: 100%;
  max-width: 800px;
  border-collapse: collapse;
  margin-bottom: 2rem;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #F2F2F2;
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 12px;
  background-color: #505F98;
  color: white;
`;

const TableData = styled.td`
  padding: 12px;
  border-bottom: 1px solid #ddd;
`;

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
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

const TransactionResult = () => {
  const [transactionData, setTransactionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pollingCount, setPollingCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const generateAddress = (caseNum, imageHash) => {
    const NAMESPACE = CryptoJS.SHA512('coc').toString(CryptoJS.enc.Hex).slice(0,6);
    const caseNumHash = CryptoJS.SHA512(caseNum).toString(CryptoJS.enc.Hex).slice(0,8);
    const imageHashTruncated = CryptoJS.SHA512(imageHash).toString(CryptoJS.enc.Hex).slice(0,56);
    return NAMESPACE + caseNumHash + imageHashTruncated;
  };

  useEffect( () => {
    const fetchTransactionData = async () => {
      const params = new URLSearchParams(location.search);
      const caseNum = params.get('caseNum');
      const imageHash = params.get('imageHash');

      if (!caseNum || !imageHash ) {
        console.error('사건 번호나 이미지 해시값이 없습니다');
        setIsLoading(false);
        return;
      }

      const address = generateAddress(caseNum, imageHash);

      const pollForData = async () => {
        if (pollingCount >= 10) {
          setError('데이터를 찾을 수 없습니다. 나중에 다시 시도해 주세요')
          setIsLoading(false);
        }

        try {
          const response = await axios.get(`api/search-transaction/${address}`);
          if (response.data && response.data.entries && response.data.entries.length > 0 ) {
            setTransactionData({
              ...response.data,
              latestEntry: response.data.entries[response.data.entries.length - 1]
            });
            setIsLoading(false);
          } else {
            setPollingCount(prevCount => prevCount + 1);
            const delay = 3000 + (pollingCount * 1000);
            setTimeout(pollForData, delay);
          }
        } catch (error) {
          console.error('이력 데이터를 가져오는데 오류가 발생하였습니다:', error);
          setError('데이터를 가져오는 중 오류가 발생하였습니다. 다시 시도해 주세요')
          setIsLoading(false);
        }
      };

      setTimeout(() => {
        pollForData();
      }, 5000);
    };

    fetchTransactionData();

  }, [location, pollingCount]);

  const qrCodeUrl = `http://localhost:3000/search-transaction/${transactionData?.address || ''}`;

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/');
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
        <Title>이력 등록 결과</Title>
        {isLoading ? (
          <>
            <LoadingSpinner />
            <p>등록 결과를 불러오는 중...</p>
          </>
        ) : error ? (
          <p>{error}</p>
        ) : transactionData ? (
          <>
            <Table>
              <tbody>
                <TableRow>
                  <TableHeader>상태</TableHeader>
                  <TableData>{transactionData.latestEntry.status}</TableData>
                </TableRow>
                <TableRow>
                  <TableHeader>등록 시간</TableHeader>
                  <TableData>{transactionData.latestEntry.registrationTime}</TableData>
                </TableRow>
                <TableRow>
                  <TableHeader>보관 장소</TableHeader>
                  <TableData>{transactionData.latestEntry.location}</TableData>
                </TableRow>
                <TableRow>
                  <TableHeader>확인자</TableHeader>
                  <TableData>{transactionData.latestEntry.checkerName}</TableData>
                </TableRow>
                <TableRow>
                  <TableHeader>매체 종류</TableHeader>
                  <TableData>{transactionData.latestEntry.deviceType}</TableData>
                </TableRow>
                <TableRow>
                  <TableHeader>이미지 파일 이름</TableHeader>
                  <TableData>{transactionData.latestEntry.imageFileName}</TableData>
                </TableRow>
                <TableRow>
                  <TableHeader>이미지 해시값</TableHeader>
                  <TableData>{transactionData.latestEntry.imageHash}</TableData>
                </TableRow>
                <TableRow>
                  <TableHeader>고유 주소</TableHeader>
                  <TableData>{transactionData.address}</TableData>
                </TableRow>
              </tbody>
            </Table>
            <QRCodeContainer>
              <QRCode value={qrCodeUrl} size={200} />
              <p>고유 주소 QR 코드</p>
            </QRCodeContainer>
          </>
        ) : (
          <p>이력 데이터를 찾을 수 없습니다</p>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default TransactionResult;