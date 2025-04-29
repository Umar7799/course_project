import { useState } from 'react';
import axios from 'axios';

export default function useFormSubmission({ template, setTemplate, user, templateId }) {
    const [answers, setAnswers] = useState({});
  const API_URL = import.meta.env.VITE_API_URL;


    const handleSubmit = async (e) => {
        e.preventDefault();

        const formattedAnswers = Object.entries(answers).map(([questionId, response]) => ({
            questionId: parseInt(questionId),
            response,
        }));

        if (formattedAnswers.length === 0) {
            alert('You must answer at least one question before submitting.');
            return;
        }

        try {
            const tempAnswerIds = formattedAnswers.map(() => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

            setTemplate(prevTemplate => {
                if (!prevTemplate) return prevTemplate;

                const updatedQuestions = prevTemplate.questions.map((question, index) => {
                    const answerForQuestion = formattedAnswers.find(a => a.questionId === question.id);
                    if (!answerForQuestion) return question;

                    return {
                        ...question,
                        answers: [
                            ...(question.answers || []),
                            {
                                id: tempAnswerIds[index],
                                response: answerForQuestion.response,
                                form: {
                                    userId: user.id,
                                    user: {
                                        id: user.id,
                                        name: user.name || user.email.split('@')[0],
                                        email: user.email
                                    },
                                    id: `temp-form-${Date.now()}`
                                },
                                _isTemp: true
                            }
                        ]
                    };
                });

                return {
                    ...prevTemplate,
                    questions: updatedQuestions
                };
            });

            const { data } = await axios.post(
                `${API_URL}/auth/forms/submit`,
                {
                    templateId: parseInt(templateId),
                    answers: formattedAnswers,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );

            setAnswers({});

            setTemplate(prevTemplate => {
                if (!prevTemplate || !data?.answers) return prevTemplate;

                return {
                    ...prevTemplate,
                    questions: prevTemplate.questions.map(question => {
                        const filteredAnswers = (question.answers || []).filter(a => !a._isTemp);

                        const newAnswers = data.answers
                            .filter(a => a.questionId === question.id)
                            .map(answer => ({
                                id: answer.id,
                                response: answer.response,
                                form: {
                                    id: answer.formId,
                                    userId: user.id,
                                    user: {
                                        id: user.id,
                                        name: user.name || user.email.split('@')[0],
                                        email: user.email
                                    }
                                }
                            }));

                        return {
                            ...question,
                            answers: [...filteredAnswers, ...newAnswers]
                        };
                    })
                };
            });

        } catch (error) {
            console.error('Error submitting form:', error);

            setTemplate(prevTemplate => {
                if (!prevTemplate) return prevTemplate;

                return {
                    ...prevTemplate,
                    questions: prevTemplate.questions.map(question => ({
                        ...question,
                        answers: (question.answers || []).filter(a => !a._isTemp)
                    }))
                };
            });

            if (error.response?.status === 400) {
                alert(error.response.data?.message || 'Form submission was invalid.');
            } else if (error.response?.status === 401) {
                alert('You must be logged in to submit the form.');
            } else {
                alert('An unexpected error occurred.');
            }
        }
    };

    const handleDeleteAnswer = async (answerId) => {
        if (!answerId) return;

        // Ensure answerId is a string before calling startsWith
        const answerIdString = String(answerId);
        const isTemp = answerIdString.startsWith('temp-');
        if (isTemp) {
            console.warn('Skipping delete for temporary answer:', answerId);
        } else {
            try {
                await axios.delete(`${API_URL}/auth/forms/answers/${answerId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
            } catch (error) {
                console.error('Error deleting answer:', error);
                alert('Failed to delete your answer.');
                return;
            }
        }

        setTemplate(prevTemplate => ({
            ...prevTemplate,
            questions: prevTemplate.questions.map(question => ({
                ...question,
                answers: question.answers?.filter(ans => ans.id !== answerId)
            }))
        }));

        setAnswers(prev => {
            const updated = { ...prev };
            const questionWithAnswer = template.questions.find(q =>
                q.answers?.some(a => a.id === answerId)
            );
            if (questionWithAnswer?.id && updated[questionWithAnswer.id]) {
                delete updated[questionWithAnswer.id];
            }
            return updated;
        });
    };


    const handleAnswerUpdate = async (answerId, newResponse, questionId) => {
        if (!answerId || !newResponse) return false; // Validate inputs

        // Ensure answerId is a string before calling startsWith
        const answerIdString = String(answerId);
        const isTemp = answerIdString.startsWith('temp-');

        if (isTemp) {
            // Update in temporary state
            setTemplate(prev => ({
                ...prev,
                questions: prev.questions.map(q =>
                    q.id === questionId
                        ? {
                            ...q,
                            answers: q.answers.map(a =>
                                a.id === answerId ? { ...a, response: newResponse } : a
                            )
                        }
                        : q
                )
            }));
            return true;
        }

        try {
            await axios.put(
                `${API_URL}/auth/forms/answers/${answerId}`,
                { response: newResponse },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );

            // Update in global state after successful API call
            setTemplate(prevTemplate => ({
                ...prevTemplate,
                questions: prevTemplate.questions.map(question => ({
                    ...question,
                    answers: question.answers?.map(ans =>
                        ans.id === answerId ? { ...ans, response: newResponse } : ans
                    )
                }))
            }));
            return true;
        } catch (error) {
            console.error('Error updating answer:', error);
            return false;
        }
    };



    return {
        answers,
        setAnswers,
        handleSubmit,
        handleDeleteAnswer,
        handleAnswerUpdate
    };
}
