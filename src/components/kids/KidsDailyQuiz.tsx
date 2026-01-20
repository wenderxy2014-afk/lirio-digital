import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [answers, setAnswers] = React.useState<Record<number, number>>({});

  const score = React.useMemo(() => {
    return questions.reduce((acc, q, i) => {
      const a = answers[i];
      if (typeof a !== "number") return acc;
      return acc + (a === q.answer_index ? 1 : 0);
    }, 0);
  }, [answers, questions]);

  if (questions.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="font-display">Joguinhos bíblicos: Quiz</CardTitle>
      </CardHeader>
      <CardContent className="text-left">
        <p className="text-sm text-muted-foreground">
          Responda e veja sua pontuação: <span className="font-medium text-foreground">{score}</span>/{questions.length}
        </p>

        <div className="mt-4 space-y-5">
          {questions.map((q, i) => {
            const chosen = answers[i];
            const hasChosen = typeof chosen === "number";
            const isCorrect = hasChosen && chosen === q.answer_index;

            return (
              <section key={i} className="rounded-xl border bg-background/30 p-4">
                <h3 className="font-medium">{i + 1}. {q.question}</h3>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oi) => {
                    const selected = chosen === oi;
                    const showRight = hasChosen && oi === q.answer_index;
                    const showWrong = hasChosen && selected && oi !== q.answer_index;

                    return (
                      <Button
                        key={oi}
                        type="button"
                        variant={selected ? "secondary" : "outline"}
                        className={[
                          "h-auto justify-start whitespace-normal text-left",
                          showRight ? "ring-2 ring-primary" : "",
                          showWrong ? "opacity-70" : "",
                        ].join(" ")}
                        onClick={() => setAnswers((prev) => ({ ...prev, [i]: oi }))}
                      >
                        {opt}
                      </Button>
                    );
                  })}
                </div>

                {hasChosen && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {isCorrect ? "Acertou!" : "Quase!"}{q.explanation ? ` ${q.explanation}` : ""}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
