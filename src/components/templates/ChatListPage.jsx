import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { fetchChatSessions, deleteChatSession } from '../../apis/chat';
import Modal from 'react-modal';
import { FaTrash } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background-color: #f9f9f9;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 32px;
  color: #333;
`;

const ChatList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
  width: 100%;
  max-width: 600px;
  margin-bottom: 24px;
`;

const ChatListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 12px;
  background-color: #f1f1f1;
  cursor: pointer;
  &:hover {
    background-color: #ddd;
  }
`;

const Button = styled.button`
  padding: 12px 16px;
  font-size: 14px;
  color: white;
  background-color: #4aaa87;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #6dc4b0;
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #e53e3e;
  cursor: pointer;
  font-size: 18px;
  &:hover {
    color: #c53030;
  }
`;

const NewChatButton = styled(Button)`
  margin-top: 20px;
`;

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const ChatListPage = () => {
  const [chatSessions, setChatSessions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetchChatSessions();
        setChatSessions(response.data);
      } catch (error) {
        console.error('Error fetching chat sessions:', error);
      }
    };

    fetchSessions();
  }, []);

  const startNewChat = () => {
    setIsModalOpen(true);
  };

  const handleNewChatSubmit = () => {
    const newSessionId = uuidv4();
    localStorage.setItem('sessionId', newSessionId);
    localStorage.setItem('sessionName', newSessionName);
    setIsModalOpen(false);
    navigate(`/chat/${newSessionId}?session_name=${encodeURIComponent(newSessionName)}`);
  };

  const openChat = (sessionId, sessionName) => {
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('sessionName', sessionName);
    navigate(`/chat/${sessionId}?session_name=${encodeURIComponent(sessionName)}`);
  };

  const deleteSession = async (sessionId) => {
    try {
      await deleteChatSession(sessionId);
      setChatSessions(chatSessions.filter(session => session.session_id !== sessionId));
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  };

  return (
    <Container>
      <Title>대화 목록</Title>
      <ChatList>
        {chatSessions.map(session => (
          <ChatListItem key={session.session_id}>
            <span onClick={() => openChat(session.session_id, session.session_name)}>
              {session.session_name || session.session_id}
            </span>
            <DeleteButton onClick={() => deleteSession(session.session_id)}>
              <FaTrash />
            </DeleteButton>
          </ChatListItem>
        ))}
      </ChatList>
      <NewChatButton onClick={startNewChat}>새 대화 생성</NewChatButton>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={customStyles}
        contentLabel="새 대화 생성"
      >
        <h2>새 대화 생성</h2>
        <input
          type="text"
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
          placeholder="대화 제목"
          required
        />
        <Button onClick={handleNewChatSubmit}>생성</Button>
      </Modal>
    </Container>
  );
};

export default ChatListPage;