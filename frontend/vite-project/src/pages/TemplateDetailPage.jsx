import React from 'react';
import { Link } from 'react-router-dom';
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
import TemplateResultPage from './TemplateResultPage';

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
        questions={(template?.questions || []).filter(q => q !== undefined)}  // Filter out undefined values
        setQuestions={(newQuestions) => setTemplate(prev => ({ ...prev, questions: newQuestions }))} // <-- ADD this line to allow reordering
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
        isAdmin={user?.role === 'ADMIN'}
        darkToggle={darkToggle}
      />


      <CommentSection
        comments={comments}
        setComments={setComments}
        user={user}
        templateId={id}
      />

      {(user?.id === template.authorId || user?.role === 'ADMIN') && (
        <>

          <div className="mb-4">
            <Link
              to={`/templates/${id}/results`}
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              View Results
            </Link>
          </div>


          <AccessManager template={template} setTemplate={setTemplate} templateId={id} />

          <TemplateActions
            isPublic={template.isPublic}
            toggleVisibility={toggleTemplateVisibility}
            templateId={id}
          />
          <AddQuestionsForm templateId={id} setTemplate={setTemplate} />
        </>
      )}
    </div>
  );
};

export default TemplateDetailPage;
