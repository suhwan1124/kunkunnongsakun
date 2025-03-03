import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchPostDetail,
  createComment,
  createReply,
  editComment,
  deleteComment,
  deletePost,
} from "../../../apis/post";
import PostDetails from "../../molecules/PostDetail";
import Comments from "../../molecules/Comment";
import { useLoading } from "../../../LoadingContext";
import {
  Container,
} from "../../../styles/Post";

const PostDetailTemplate = () => {
  const { id } = useParams();
  const { setIsLoading } = useLoading();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyCommentId, setReplyCommentId] = useState(null);
  const [newReply, setNewReply] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [showSettingsMenu, setShowSettingsMenu] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUserId = localStorage.getItem("userId");

  const settingsMenuRefs = useRef([]);

  const fetchPost = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchPostDetail(id);
      setPost(response.data);
      setComments(response.data.comments || []);
    } catch (error) {
      alert("게시글을 불러오는데 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }, [id, setIsLoading]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      settingsMenuRefs.current.forEach((ref, index) => {
        if (ref && !ref.contains(event.target)) {
          setShowSettingsMenu((prev) => ({
            ...prev,
            [index]: false,
          }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const handleEditCommentChange = (event) => {
    setEditCommentContent(event.target.value);
  };

  const handleReplyChange = (event) => {
    setNewReply(event.target.value);
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    try {
      await createComment(id, { content: newComment });
      await fetchPost();
      setNewComment("");
    } catch (error) {
      alert("댓글 작성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleSubmitReply = async (event) => {
    event.preventDefault();
    try {
      await createReply(id, { content: newReply, parent_id: replyCommentId });
      await fetchPost();
      setNewReply("");
      setReplyCommentId(null);
    } catch (error) {
      alert("답글 작성에 실패했습니다.");
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      await editComment(commentId, { content: editCommentContent });
      const updatedComments = comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, content: editCommentContent }
          : comment
      );
      setComments(updatedComments);
      setEditCommentId(null);
      setEditCommentContent("");
    } catch (error) {
      alert("댓글 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      alert("댓글 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(id);
      if (post.post_type === "sell") {
        navigate("/sellboard");
      }
      if (post.post_type === "buy") {
        navigate("/buyboard");
      }
      if (post.post_type === "exchange") {
        navigate("/exchangeboard");
      }
    } catch (error) {
      console.error("Failed to delete post", error);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSettingsClick = (index) => {
    setShowSettingsMenu((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (!post) {
    return <Container>게시글을 불러오는 중입니다...</Container>;
  }

  return (
    <Container>
      <PostDetails
        post={post}
        currentUserId={currentUserId}
        showSettingsMenu={showSettingsMenu}
        settingsMenuRefs={settingsMenuRefs}
        openModal={openModal}
        handleSettingsClick={handleSettingsClick}
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        handleDeletePost={handleDeletePost}
      />
      <Comments
        comments={comments}
        newComment={newComment}
        newReply={newReply}
        replyCommentId={replyCommentId}
        editCommentId={editCommentId}
        editCommentContent={editCommentContent}
        handleCommentChange={handleCommentChange}
        handleEditCommentChange={handleEditCommentChange}
        handleReplyChange={handleReplyChange}
        handleSubmitComment={handleSubmitComment}
        handleSubmitReply={handleSubmitReply}
        handleEditComment={handleEditComment}
        handleDeleteComment={handleDeleteComment}
        setReplyCommentId={setReplyCommentId}
        currentUserId={currentUserId}
        setEditCommentId={setEditCommentId}
        setEditCommentContent={setEditCommentContent}
        setShowSettingsMenu={setShowSettingsMenu}
      />
    </Container>
  );
};

export default PostDetailTemplate;