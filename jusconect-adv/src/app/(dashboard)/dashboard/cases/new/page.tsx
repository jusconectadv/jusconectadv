import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createCaseAction } from "@/src/services/cases";

export default async function NewCasePage() {
  const context = await requireUserContext();
  const supabase = await createSupabaseServerClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("tenant_id", context.tenant!.id);

  return (
    <form action={createCaseAction} className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold">Novo caso</h1>

      <select name="clientId" required className="w-full border p-2">
        <option value="">Selecione o cliente</option>
        {clients?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        name="title"
        placeholder="Título"
        required
        className="w-full border p-2"
      />

      <textarea
        name="description"
        placeholder="Descrição"
        className="w-full border p-2"
      />

      <select name="priority" className="w-full border p-2">
        <option value="medium">Médio</option>
        <option value="high">Alto</option>
        <option value="urgent">Urgente</option>
        <option value="low">Baixo</option>
      </select>

      <button className="bg-black text-white px-4 py-2 rounded">
        Criar caso
      </button>
    </form>
  );
}