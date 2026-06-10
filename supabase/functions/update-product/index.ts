import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { id, data, inventory } = await req.json();

    if (!data) {
      return new Response(
        JSON.stringify({ error: "Missing data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const client = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let productId = id;

    if (id) {
      const { error } = await client.from("products").update(data).eq("id", id);
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      const { data: created, error } = await client
        .from("products")
        .insert(data)
        .select()
        .single();
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      productId = created.id;
    }

    // Upsert inventory if provided
    if (inventory && inventory.length > 0 && productId) {
      const invRows = inventory.map((s: { size: string; quantity: number }) => ({
        product_id: productId,
        size: s.size,
        stock_quantity: s.quantity,
      }));
      const { error: invError } = await client
        .from("inventory")
        .upsert(invRows, { onConflict: "product_id,size" });
      if (invError) {
        console.error("Inventory upsert error:", invError.message);
      }
    }

    return new Response(
      JSON.stringify({ success: true, productId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
