import { createClient } from "@/lib/supabase/server"

export async function debugInsert(merchantId: string, name: string) {
  const supabase = await createClient()
  const result = await supabase.from('queue_items').insert({
    merchant_id: merchantId,
    customer_name: name,
    status: 'waiting',
    name_flagged: false
  }).select()
  console.log("DEBUG INSERT RESULT:", result)
  return result;
}
