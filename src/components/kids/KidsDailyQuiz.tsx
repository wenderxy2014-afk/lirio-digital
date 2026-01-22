import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Trophy, RefreshCw, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

export type KidsQuizQuestion = {
  question: string;
  options: string[];
  answer_index: number;
  explanation?: string;
};

function clampQuiz(raw: unknown): KidsQuizQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((q) => {
      const question = typeof q?.question === "string" ? q.question : "";
      const options = Array.isArray(q?.options) ? q.options.filter((o: unknown) => typeof o === "string") : [];
      const answer_index = typeof q?.answer_index === "number" ? q.answer_index : -1;
      const explanation = typeof q?.explanation === "string" ? q.explanation : undefined;

      if (!question || options.length < 2) return null;
      return { question, options: options.slice(0, 4), answer_index, explanation } as KidsQuizQuestion;
    })
    .filter(Boolean) as KidsQuizQuestion[];
}

export function KidsDailyQuiz({ quiz }: { quiz: unknown }) {
  const questions = React.useMemo(() => clampQuiz(quiz), [quiz]);

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [isAnswered, setIsAnswered] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [showResult, setShowResult] = React.useState(false);

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    if (index === questions[currentIndex].answer_index) {
      setScore(s => s + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#eab308', '#3b82f6'] // Green, Yellow, Blue
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      if (score === questions.length) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];

  if (showResult) {
    return (
      <Card className="overflow-hidden border-4 border-yellow-400 shadow-xl bg-orange-50">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <div className="mb-4 rounded-full bg-yellow-400 p-6 shadow-lg animate-bounce">
            <Trophy className="h-16 w-16 text-white" />
          </div>
          <h2 className="mb-2 font-display text-4xl text-orange-600">Parabéns!</h2>
          <p className="mb-6 text-xl font-medium text-orange-800">
            Você acertou <span className="text-3xl font-bold">{score}</span> de {questions.length} perguntas!
          </p>
          <Button
            onClick={handleRestart}
            size="lg"
            className="h-14 rounded-full bg-blue-500 px-8 text-xl font-bold hover:bg-blue-600 shadow-blue-200 shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <RefreshCw className="mr-2 h-6 w-6" /> Jogar de novo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-2 border-indigo-200 shadow-xl">
      <CardHeader className="bg-indigo-50 border-b border-indigo-100">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-2xl text-indigo-700 flex items-center gap-2">
            <Star className="fill-yellow-400 text-yellow-500 h-6 w-6" /> Quiz Bíblico
          </CardTitle>
          <span className="rounded-full bg-indigo-200 px-3 py-1 text-sm font-bold text-indigo-800">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6 min-h-[80px]">
          <h3 className="text-xl font-semibold leading-relaxed text-slate-700">
            {currentQuestion.question}
          </h3>
        </div>

        <div className="grid gap-3 mb-6">
          {currentQuestion.options.map((opt, i) => {
            const isSelected = selectedOption === i;
            const isCorrect = i === currentQuestion.answer_index;

            // Logic for button styles
            // If answered:
            // - Correct option -> Green
            // - Selected & Wrong -> Red
            // - Others -> Faded

            let btnClass = "h-auto p-4 justify-start text-lg font-medium border-2 transition-all hover:scale-[1.01]";
            let variant = "outline" as const;

            if (isAnswered) {
              if (isCorrect) {
                btnClass += " bg-green-100 border-green-500 text-green-800 shadow-sm";
              } else if (isSelected) {
                btnClass += " bg-red-100 border-red-500 text-red-800 shadow-sm";
              } else {
                btnClass += " opacity-50 bg-slate-50 border-slate-200";
              }
            } else {
              btnClass += " border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 bg-white";
            }

            return (
              <Button
                key={i}
                type="button"
                variant={variant}
                className={btnClass}
                onClick={() => handleOptionClick(i)}
                disabled={isAnswered}
              >
                {isAnswered && isCorrect && <CheckCircle className="mr-2 h-5 w-5 text-green-600 shrink-0" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="mr-2 h-5 w-5 text-red-600 shrink-0" />}
                {!isAnswered && <div className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 border border-indigo-200">
                  {String.fromCharCode(65 + i)}
                </div>}
                <span className="whitespace-normal text-left">{opt}</span>
              </Button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className={cn(
              "mb-4 p-4 rounded-xl border-l-4",
              selectedOption === currentQuestion.answer_index
                ? "bg-green-50 border-green-500 text-green-800"
                : "bg-red-50 border-red-500 text-red-800"
            )}>
              <p className="font-bold mb-1">
                {selectedOption === currentQuestion.answer_index ? "Muito bem! 🌟" : "Ops! Não foi dessa vez."}
              </p>
              {currentQuestion.explanation && (
                <p className="text-sm opacity-90">{currentQuestion.explanation}</p>
              )}
            </div>

            <Button
              onClick={handleNext}
              className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200/50 rounded-xl"
            >
              {currentIndex < questions.length - 1 ? "Próxima Pergunta" : "Ver Resultado"} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
