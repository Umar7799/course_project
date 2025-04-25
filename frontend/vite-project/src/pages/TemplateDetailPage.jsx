import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import useTemplateDetail from '../hooks/useTemplateDetail';
import useFormSubmission from '../hooks/useFormSubmission';
import useQuestionEditing from '../hooks/useQuestionEditing';

import TemplateActions from '../components/templateDetail/TemplateActions';
import TemplateHeader from '../components/templateDetail/TemplateHeader';
import CommentSection from '../components/templateDetail/CommentSection';
import AccessManager from '../components/templateDetail/AccessManager';
import FormSubmission from '../components/templateDetail/FormSubmission';
import AddQuestionsForm from '../components/templateDetail/AddQuestionsForm';

const TemplateDetailPage = () => {
  const { id } = useParams();
  const { user, darkToggle } = useAuth();

  // Custom Hooks
  const {
    template,
    setTemplate,
    error,
    hasLiked,
    likesCount,
    handleLikeToggle,
    toggleTemplateVisibility,
    comments,
    setComments,
  } = useTemplateDetail(id, user);

  const {
    answers,
    setAnswers,
    handleSubmit,
    handleDeleteAnswer,
    handleAnswerUpdate
  } = useFormSubmission({ template, setTemplate, user, templateId: id });

  const {
    isEditing,
    setIsEditing,
    editedQuestion,
    setEditedQuestion,
    handleEditQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
  } = useQuestionEditing({ templateId: id, setTemplate });

  if (!template) return <div>Loading template...</div>;

  return (
    <div className={darkToggle ? "mt-2 p-4 pt-20 bg-gray-500 text-white" : "mt-2 p-4 pt-20"}>
      {error && <div className="text-red-500 font-semibold mb-4">{error}</div>}

      <TemplateHeader
        title={template.title}
        description={template.description}
        images={template.images}
        likes={likesCount}
        hasLiked={hasLiked}
        onLike={handleLikeToggle}
      />

      <FormSubmission
        questions={template.questions}
        answers={answers}
        setAnswers={setAnswers}
        handleSubmit={handleSubmit}
        handleUpdateQuestion={handleUpdateQuestion}
        handleEditQuestion={handleEditQuestion}
        handleDeleteQuestion={handleDeleteQuestion}
        handleDeleteAnswer={handleDeleteAnswer}
        handleAnswerUpdate={handleAnswerUpdate}
        isEditing={isEditing}
        editedQuestion={editedQuestion}
        setEditedQuestion={setEditedQuestion}
        setIsEditing={setIsEditing}
        user={user}
        isAuthor={user?.id === template.authorId}
        isAdmin={user?.role === 'admin'}
        darkToggle={darkToggle}
      />


      <CommentSection
        comments={comments}
        setComments={setComments}
        user={user}
        templateId={id}
      />

      {(user?.id === template.authorId || user?.role === 'admin') && (
        <>
          {user?.id === template.authorId && (
            <AccessManager template={template} setTemplate={setTemplate} templateId={id} />
          )}

          <TemplateActions
            isPublic={template.isPublic}
            toggleVisibility={toggleTemplateVisibility}
            templateId={id}
          />
          <AddQuestionsForm templateId={id} />
        </>
      )}
    </div>
  );
};

export default TemplateDetailPage;
