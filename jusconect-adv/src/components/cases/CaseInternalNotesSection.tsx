import {
  createCaseNoteAction,
  deleteCaseNoteAction,
  getCaseNotes,
} from "@/src/services/case-notes";

type CaseInternalNotesSectionProps = {
  caseId: string;
};

function formatDate(date: string): string {
  return new Date(date).toLocaleString("pt-BR");
}

export async function CaseInternalNotesSection({
  caseId,
}: CaseInternalNotesSectionProps) {
  const notes = await getCaseNotes(caseId);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-semibold text-slate-950">Notas internas</h2>

        <p className="mt-1 text-sm text-slate-500">
          Anotações visíveis apenas para o escritório. O cliente não consegue
          visualizar essas informações.
        </p>
      </div>

      <form action={createCaseNoteAction} className="mt-5 space-y-3">
        <input type="hidden" name="caseId" value={caseId} />

        <textarea
          name="content"
          required
          rows={4}
          placeholder="Ex: verificar prazo, pedir contrato original, avaliar honorários, conferir documentos..."
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-slate-950"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Salvar nota
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {notes.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            Nenhuma nota interna registrada ainda.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nota interna
                </span>

                <span className="text-xs text-slate-400">
                  {formatDate(note.created_at)}
                </span>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">
                {note.content}
              </p>

              <form
                action={deleteCaseNoteAction}
                className="mt-3 flex justify-end"
              >
                <input type="hidden" name="caseId" value={caseId} />
                <input type="hidden" name="noteId" value={note.id} />

                <button
                  type="submit"
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Excluir nota
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}