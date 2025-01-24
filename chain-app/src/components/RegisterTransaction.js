import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment-timezone';
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

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: #505F98;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  flex-direction: column;
  align-items: center;
  margin-botoom: 1rem;
`;

const Label = styled.label`
  display: inline-flex;
  margin-bottom: 0.5rem;
  color: #505F98
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  background-color: #FBFBFD;
  border: 1px solid #505F98;
  color: #505F98;
  box-sizing: border-box;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  background-color: #FBFBFD;
  border: 1px solid #505F98;
  color: #505F98;
  box-sizing: border-box;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.5rem 1rem;
  background-color: #111B47;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  &:hover {
    opacity: 0.8;
  }
`;

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: #FBFBFD;
  padding: 30px;
  border-radius: 8px;
  width: 350px;
  border: 2px solid #505F98;
  box-shadow: 0 0 20px rgba(80, 95, 152, 0.3);
`;

const ModalTitle = styled.h2`
  color: #0A1133;
  margin-bottom: 20px;
  text-align: center;
`;

const ModalText = styled.p`
  color: #505F98;
  margin-bottom: 15px;
`;

const ModalInput = styled(Input)`
  margin-bottom: 20px;
  &:focus {
    outline: none;
    border-color: #0A1133;
  }
`;

const ModalButton = styled(Button)`
  margin-top: 10px;
  width: calc(50% - 5px);
  &:first-of-type {
    margin-right: 10px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DisabledInput = styled(Input)`
  background-color: #E8EAF2;
  cursor: not-allowed;
`;

const Title = styled.h1`
  font-size: 2.0rem;
  margin-bottom: 2rem;
  background: linear-gradient(45deg, #0A1133, #505F98);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
`;

const RegisterTransaction = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    registrationTime: '',
    status: '',
    caseNum: '',
    location: '',
    checkerName: '',
    deviceType: '',
    imageFileName: '',
    imageHash: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const now = moment().tz('Asia/Seoul').format('YYYY-MM-DDTHH:mm');
    setFormData(prevData => ({...prevData, registrationTime: now}));
  
    const userString = sessionStorage.getItem('user');
    if (userString) {
      setUser(JSON.parse(userString));
    } else {
      navigate('/login');
    }
    
    if (location.pathname === '/register-transaction') {
      setFormData(prevData => ({...prevData, status: '보관'}));
    }
  }, [navigate, location]);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData(prevData => ({...prevData, [name]: value}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirm = async () => {
    try {
      const response = await axios.post('/api/register-transaction', {
        userId: user.id,
        password,
        transactionData: formData
      });
      console.log(response.data);
      alert('이력 등록 성공!');
      setShowModal(false);
      navigate(`/transaction-result?caseNum=${encodeURIComponent(formData.caseNum)}&imageHash=${encodeURIComponent(formData.imageHash)}`);
    } catch (error) {
      console.error('Error registering transaction:', error);
      alert('Failed to register transaction. Please try again.');
    }
  };

  return (
    <PageContainer>
      <Header>
        <LeftNav>
          <NavItem to="/">Home</NavItem>
        </LeftNav>
        <RightNav>
          <NavItem as="button" onClick={() => {
            sessionStorage.removeItem('user');
            navigate('/');
          }}>로그아웃</NavItem>
        </RightNav>
      </Header>
      <FormContainer>
        <Title>보관 이력 등록하기</Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="registrationTime">등록 시간(현재 시간)</Label>
            <DisabledInput
              type="datetime-local"
              id="registrationTime"
              name="registrationTime"
              value={formData.registrationTime}
              readOnly
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="status">상태</Label>
            <DisabledInput id="status" name="status" value={formData.status} disabled
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="caseNum">사건 번호</Label>
            <Input type="text" id="caseNum" name="caseNum" value={formData.caseNum} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="location">보관 장소</Label>
            <Input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="checkerName">확인자</Label>
            <Input type="text" id="checkerName" name="checkerName" value={formData.checkerName} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="deviceType">매체 종류</Label>
            <Select id="deviceType" name="deviceType" value={formData.deviceType} onChange={handleChange} required>
                <option value="">선택</option>
                <option value="PC">PC</option>
                <option value="HDD/SSD">HDD/SSD</option>
                <option value="USB">USB</option>
                <option value="ExternalHDD">외장하드</option>
                <option value="Mobile">모바일</option>
                <option value="Other">기타</option>
              </Select>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="imageFileName">이미지 파일 이름</Label>
            <Input type="text" id="imageFileName" name="imageFileName" value={formData.imageFileName} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="imageHash">이미지 해시값</Label>
              <Input type="text" id="imageHash" name="imageHash" value={formData.imageHash} onChange={handleChange} required />
            </FormGroup>
        <Button type="submit">등록하기</Button>
        </Form>
      </FormContainer>
      {showModal && (
        <ModalBackground>
          <ModalContent>
            <ModalTitle>등록 확인</ModalTitle>
            <ModalText>User ID: {user.id}</ModalText>
            <ModalInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <ButtonContainer>
              <ModalButton onClick={handleConfirm}>블록체인 등록</ModalButton>
              <ModalButton onClick={() => setShowModal(false)}>취소</ModalButton>
            </ButtonContainer>
          </ModalContent>
        </ModalBackground>
      )}
    </PageContainer>
  );
};

export default RegisterTransaction;