import {
  createCaseNoteAction,
  deleteCaseNoteAction,
  getCaseNotes,
} from "@/src/services/case-notes";

type CaseInternalNotesSectionProps = {
  caseId: string;
};

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

export async function CaseInternalNotesSection({
  caseId,
}: CaseInternalNotesSectionProps) {
  const notes = await getCaseNotes(caseId);

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
      <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
          Interno
        </p>

        <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
          Notas internas
        </h2>

        <p className="mt-1 text-sm leading-6 text-[#5B6472]">
          Anotações visíveis apenas para o escritório. O cliente não consegue
          visualizar essas informações.
        </p>
      </div>

      <form action={createCaseNoteAction} className="space-y-3 p-5">
        <input type="hidden" name="caseId" value={caseId} />

        <textarea
          name="content"
          required
          rows={4}
          placeholder="Ex: verificar prazo, pedir contrato original, avaliar honorários, conferir documentos..."
          className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-[#0B1D2D] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#132D44]"
          >
            Salvar nota
          </button>
        </div>
      </form>

      <div className="space-y-3 border-t border-[#ECE7DD] bg-white p-5">
        {notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-4 text-sm leading-6 text-[#5B6472]">
            Nenhuma nota interna registrada ainda.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="rounded-2xl border border-[#D8D2C7] bg-[#F8F6F1] p-4 transition hover:border-[#C89B4A]/60"
            >
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex w-fit rounded-full border border-[#E7D7B5] bg-[#FFF8E8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#9E762D]">
                  Nota interna
                </span>

                <span className="text-xs font-medium text-[#8FA0AE]">
                  {formatDate(note.created_at)}
                </span>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-7 text-[#0B1D2D]">
                {note.content}
              </p>

              <form
                action={deleteCaseNoteAction}
                className="mt-4 flex justify-end"
              >
                <input type="hidden" name="caseId" value={caseId} />
                <input type="hidden" name="noteId" value={note.id} />

                <button
                  type="submit"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
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