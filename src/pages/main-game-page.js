import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import styles from "@/styles/Game.module.css";
import useSound from 'use-sound';
import { useRouter } from "next/router";
import { useMusic } from '@/MusicContext.js';

export default function MainGamePage() {
    const { isSoundOn, toggleSound } = useMusic();
    const [text, setText] = useState("");
    const [fullText, setFullText] = useState("Привет! Давай поиграем в игру.");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [userAnswer, setUserAnswer] = useState("");
    const [feedback, setFeedback] = useState("");
    const [isCorrect, setIsCorrect] = useState(null);
    const [stage, setStage] = useState("greeting");
    const [isTyping, setIsTyping] = useState(true);
    const [imagePath, setImagePath] = useState("/sans-idle.gif");
    const textBoxRef = useRef(null);
    const router = useRouter();

    const voiceUrl = '/voice.mp3';
    const clickUrl = '/click.mp3';

    const [playVoice, { stop: stopVoice }] = useSound(voiceUrl, { volume: isSoundOn ? 0.5 : 0, loop: true });
    const [playClick] = useSound(clickUrl, { volume: isSoundOn ? 1 : 0 });

    useEffect(() => {
        fetch("/undertaleQuestions.json")
            .then((response) => response.json())
            .then((data) => setQuestions(data));
    }, []);

    useEffect(() => {
        if (isTyping) {
            if (isSoundOn) playVoice();
            let index = 0;
            setText("");
            const intervalId = setInterval(() => {
                if (index <= fullText.length) {
                    setText(fullText.slice(0, index));
                    index++;
                } else {
                    clearInterval(intervalId);
                    setIsTyping(false);
                }
            }, 30);

            return () => {
                stopVoice();
                clearInterval(intervalId);
            };
        }
    }, [fullText, isTyping, isSoundOn]);

    const handleNextStage = () => {
        setImagePath("/sans-idle.gif");
        if (stage === "greeting") {
            setStage("question");
            setFullText(questions[currentQuestionIndex]?.question || "");
            setIsTyping(true);
        } else if (stage === "feedback") {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setStage("question");
                setFullText(questions[currentQuestionIndex + 1].question);
                setIsTyping(true);
                setFeedback("");
                setUserAnswer("");
                setIsCorrect(null);
            } else {
                setStage("end");
                setImagePath("/sans-win.gif");
                setFullText("Спасибо за игру! Вы стали настоящими профи в Андертейл!");
                setIsTyping(true);
            }
        }
    };

    const handleAnswerSelection = (selectedAnswer) => {
        playClick();
        const correctAnswer = questions[currentQuestionIndex].correctAnswer;
        const feedbackText = selectedAnswer === correctAnswer ? "Правильно!" : `Неправильно! Правильный ответ: ${correctAnswer}`;

        setIsCorrect(selectedAnswer === correctAnswer);
        setFeedback(feedbackText);
        setFullText(feedbackText);

        if (selectedAnswer === correctAnswer) {
            setImagePath("/sans-right.gif");
        } else {
            setImagePath("/sans-wrong.gif");
        }

        setTimeout(() => {
            setImagePath("/sans-idle.gif");
        }, 3000);

        setStage("feedback");
        setIsTyping(true);
    };

    const handleAnswerSubmit = () => {
        playClick();
        const correctAnswer = questions[currentQuestionIndex].correctAnswer[0];
        const formattedCorrectAnswers = questions[currentQuestionIndex].correctAnswer.map((a) => a.replace(/\s+/g, '').toLowerCase());
        const formattedUserAnswer = userAnswer.replace(/\s+/g, '').toLowerCase();

        const feedbackText = formattedCorrectAnswers.includes(formattedUserAnswer) ? "Правильно!" : `Неправильно! Правильный ответ: ${correctAnswer}`;
        setIsCorrect(formattedCorrectAnswers.includes(formattedUserAnswer));
        setFeedback(feedbackText);
        setFullText(feedbackText);

        if (formattedCorrectAnswers.includes(formattedUserAnswer)) {
            setImagePath("/sans-right.gif");
        } else {
            setImagePath("/sans-wrong.gif");
        }

        setStage("feedback");
        setIsTyping(true);
    };

    const handleTextBoxClick = () => {
        if (!isTyping) {
            handleNextStage();
        } else {
            setIsTyping(false);
            setText(fullText);
        }
    };

    const goHome = () => {
        router.push('/');
    };

    return (
        <>
            <Head>
                <title>Викторина</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.page}>
                <main className={styles.main}>
                    <div className={styles.header}>
                        <button onClick={goHome} className={styles.homeButton}>
                            <img src="/home.png" alt="Home" />
                        </button>
                        <button onClick={toggleSound} className={styles.soundButton}>
                            <img src={isSoundOn ? "/volumeOn.png" : "/volumeOff.png"} alt="Sound" />
                        </button>
                    </div>
                    <img
                        className={`${styles.sans} ${isCorrect === true ? styles.greenBorder : isCorrect === false ? styles.redBorder : ''}`}
                        src={imagePath}
                        alt="loading..."
                    />
                    <div
                        className={styles.textBox}
                        onClick={handleTextBoxClick}
                        ref={textBoxRef}
                    >
                        <p>{text}</p>
                    </div>
                    {stage === "question" && questions.length > 0 && currentQuestionIndex < questions.length && (
                        <>
                            {questions[currentQuestionIndex].type === "options" ? (
                                <div className={styles.options}>
                                    {questions[currentQuestionIndex].options.map((option, index) => (
                                        <button className={styles.option} key={index} onClick={() => handleAnswerSelection(option)}>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        placeholder="Введите ваш ответ"
                                        className={styles.input}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAnswerSubmit();
                                            }
                                        }}
                                    />
                                    <button className={styles.answerButton} onClick={handleAnswerSubmit}>Ответить</button>
                                </>
                            )}
                        </>
                    )}
                </main>
            </div>
        </>
    );
}
