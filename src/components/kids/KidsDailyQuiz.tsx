import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Trophy, RefreshCw, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { supabase } from "@/integrations/supabase/client"; // Removed Supabase
import { useToast } from "@/components/ui/use-toast";
import { Crown, Medal, User, Calendar } from "lucide-react";

export type KidsQuizQuestion = {
  question: string;
  options: string[];
  answer_index: number;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
};

type RankingEntry = {
  id: string;
  name: string;
  score: number;
  age: number;
  created_at: string;
};

// Initial Mock Data (Local System)
const INITIAL_RANKING: RankingEntry[] = [
  { id: '1', name: 'Davi', score: 5, age: 8, created_at: new Date().toISOString() },
  { id: '2', name: 'Ester', score: 4, age: 7, created_at: new Date().toISOString() },
  { id: '3', name: 'Samuel', score: 3, age: 9, created_at: new Date().toISOString() },
  { id: '4', name: 'Rebeca', score: 3, age: 6, created_at: new Date().toISOString() },
  { id: '5', name: 'Lucas', score: 2, age: 8, created_at: new Date().toISOString() },
];

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
  const { toast } = useToast();
  const questions = React.useMemo(() => clampQuiz(quiz), [quiz]);

  // Game States: 'START' | 'PLAYING' | 'FINISHED'
  const [gameState, setGameState] = React.useState<'START' | 'PLAYING' | 'FINISHED'>('START');

  // User Data
  const [userData, setUserData] = React.useState({ name: "", age: "" });

  // Gameplay
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [isAnswered, setIsAnswered] = React.useState(false);
  const [score, setScore] = React.useState(0);

  // Ranking
  const [ranking, setRanking] = React.useState<RankingEntry[]>([]);
  const [isLoadingRanking, setIsLoadingRanking] = React.useState(false);

  // Level System (Derived from index)
  // Level 1: Q1-Q3 (0,1,2)
  // Level 2: Q4-Q6 (3,4,5)
  // Level 3: Q7+ (6+)
  const currentLevel = Math.floor(currentIndex / 3) + 1;

  React.useEffect(() => {
    loadLocalRanking();
  }, []);

  const loadLocalRanking = () => {
    // Try to get from localStorage
    const saved = localStorage.getItem('kids_quiz_ranking');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRanking(parsed);
      } catch (e) {
        console.error("Failed to parse ranking", e);
        setRanking(INITIAL_RANKING);
      }
    } else {
      setRanking(INITIAL_RANKING);
    }
  };

  const handleStartGame = () => {
    if (!userData.name.trim() || !userData.age) {
      toast({
        title: "Ops!",
        description: "Por favor, digite seu nome e idade para começar.",
        variant: "destructive",
      });
      return;
    }
    setGameState('PLAYING');
    setCurrentIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
  };

  const saveScore = (finalScore: number) => {
    const newEntry: RankingEntry = {
      id: crypto.randomUUID(),
      name: userData.name,
      age: parseInt(userData.age),
      score: finalScore,
      created_at: new Date().toISOString(),
    };

    // Merge with current ranking
    const updatedRanking = [...ranking, newEntry];

    // Sort by score (desc) then date (desc)
    updatedRanking.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Keep only Top 5
    const top5 = updatedRanking.slice(0, 5);

    // Save
    setRanking(top5);
    localStorage.setItem('kids_quiz_ranking', JSON.stringify(top5));
  };

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    if (index === questions[currentIndex].answer_index) {
      const newScore = score + 1;
      setScore(newScore);

      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#eab308']
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setGameState('FINISHED');
      saveScore(score); // Save immediately when finished

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
    setGameState('START');
    // Keep user data but reset game
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
  };

  if (questions.length === 0) return null;



  const currentQuestion = questions[currentIndex];

  // --- RENDER: START SCREEN ---
  if (gameState === 'START') {
    return (
      <Card className="overflow-hidden border-4 border-indigo-200 shadow-xl bg-gradient-to-br from-indigo-50 to-white">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-indigo-100 p-4 rounded-full w-fit mb-4 animate-bounce">
            <User className="h-10 w-10 text-indigo-600" />
          </div>
          <CardTitle className="font-display text-3xl text-indigo-800">Quem vai jogar?</CardTitle>
          <p className="text-slate-600">Digite seu nome e idade para entrar no ranking!</p>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-bold text-indigo-700">Seu Nome</Label>
              <Input
                id="name"
                placeholder="Ex: Davi"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="h-12 text-lg border-2 border-indigo-100 focus:border-indigo-400 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="text-lg font-bold text-indigo-700">Sua Idade</Label>
              <Input
                id="age"
                type="number"
                placeholder="Ex: 8"
                value={userData.age}
                onChange={(e) => setUserData({ ...userData, age: e.target.value })}
                className="h-12 text-lg border-2 border-indigo-100 focus:border-indigo-400 rounded-xl"
              />
            </div>
          </div>

          <Button
            onClick={handleStartGame}
            className="w-full h-14 text-xl font-bold bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-200"
          >
            Começar o Desafio! <ArrowRight className="ml-2 h-6 w-6" />
          </Button>

          {/* Mini Leaderboard Preview */}
          <div className="mt-8 pt-6 border-t border-indigo-100">
            <h3 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" /> Top Jogadores
            </h3>
            <div className="space-y-2">
              {ranking.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-indigo-50/50 p-2 rounded-lg">
                  <span className="font-medium text-slate-700">#{i + 1} {r.name}</span>
                  <span className="font-bold text-indigo-600">{r.score}pts</span>
                </div>
              ))}
              {ranking.length === 0 && <p className="text-xs text-slate-400">Seja o primeiro a jogar hoje!</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- RENDER: RESULTS SCREEN ---
  if (gameState === 'FINISHED') {
    return (
      <Card className="overflow-hidden border-4 border-yellow-400 shadow-xl bg-orange-50">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
          <div className="mb-4 rounded-full bg-yellow-400 p-6 shadow-lg animate-bounce">
            <Trophy className="h-16 w-16 text-white" />
          </div>
          <h2 className="mb-2 font-display text-4xl text-orange-600">Quiz Finalizado!</h2>
          <p className="mb-6 text-xl font-medium text-orange-800">
            {userData.name}, você fez <span className="text-4xl font-bold">{score}</span> de {questions.length} pontos!
          </p>

          <div className="w-full max-w-md bg-white/50 rounded-2xl p-4 mb-8 border border-orange-100">
            <h3 className="font-bold text-orange-800 mb-4 flex items-center justify-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" /> Ranking dos Campeões
            </h3>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-2">
                {ranking.map((r, i) => (
                  <div
                    key={r.id || i}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all",
                      r.name === userData.name && r.score === score
                        ? "bg-yellow-100 border-yellow-300 scale-[1.02] shadow-sm"
                        : "bg-white border-orange-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm",
                        i === 0 ? "bg-yellow-400 text-yellow-900" :
                          i === 1 ? "bg-slate-300 text-slate-800" :
                            i === 2 ? "bg-amber-600 text-amber-100" :
                              "bg-orange-100 text-orange-600"
                      )}>
                        {i + 1}
                      </div>
                      <div className="text-left leading-tight">
                        <span className="block font-bold text-slate-800">{r.name}</span>
                        <span className="text-xs text-slate-500">{r.age} anos</span>
                      </div>
                    </div>
                    <div className="font-display text-xl text-orange-600">{r.score}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Button
            onClick={handleRestart}
            size="lg"
            className="h-14 rounded-full bg-blue-500 px-8 text-xl font-bold hover:bg-blue-600 shadow-blue-200 shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <RefreshCw className="mr-2 h-6 w-6" /> Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  // --- RENDER: PLAYING ---

  return (
    <Card className="overflow-hidden border-2 border-indigo-200 shadow-xl">
      <CardHeader className="bg-indigo-50 border-b border-indigo-100 pb-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="font-display text-2xl text-indigo-700 flex items-center gap-2">
            <Star className="fill-yellow-400 text-yellow-500 h-6 w-6" />
            Nível {currentLevel}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-indigo-400">Score:</span>
            <span className="font-display text-2xl text-indigo-600">{score}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-full transition-all duration-500"
            style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
          />
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
