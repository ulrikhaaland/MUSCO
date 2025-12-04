import { SingleDayProgramResult } from '@/app/features/gym/types';

export function SingleDayProgramView({ result, t: _t }: { result: SingleDayProgramResult; t: (k: string)=>string }) {
  const day = result.day;
  return (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      <div className="hidden md:flex py-6 items-center justify-center mt-4">
        <div className="flex flex-col items-center">
          <h1 className="text-app-title text-center">{result.title}</h1>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl overflow-hidden ring-1 ring-gray-700/50 p-6 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-3 h-3 rounded-full bg-indigo-500/40" />
          <div className="text-white font-medium">{result.sessionOverview}</div>
        </div>
        <div className="text-gray-300 text-sm">{result.summary}</div>
      </div>

      <div className="bg-gray-800/50 rounded-2xl ring-1 ring-gray-700/50 p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-3 h-3 rounded-full bg-indigo-500/40" />
          <div className="text-white font-medium">{day.description}</div>
          <div className="ml-auto text-sm text-gray-400">~{day.duration} min</div>
        </div>
        <div className="space-y-2">
          {day.exercises.map((ex, idx) => (
            <div key={idx} className="px-3 py-2 rounded-lg bg-gray-800/60 text-gray-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{ex.exerciseId}{ex.warmup ? ' (warmup)' : ''}</div>
                {ex.modification && <div className="text-xs opacity-80">{ex.modification}</div>}
                {ex.precaution && <div className="text-xs opacity-80">{ex.precaution}</div>}
              </div>
              {typeof ex.duration === 'number' && <div className="text-xs opacity-80">{ex.duration} min</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-400">{result.whatNotToDo}</div>
    </div>
  );
}





