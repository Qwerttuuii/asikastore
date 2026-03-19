import { serve } from "https://deno.land/std/http/server.ts"

serve(async (req) => {

  const { reference } = await req.json()

  const paystackRes = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers:{
        Authorization:`Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`
      }
    }
  )

  const data = await paystackRes.json()

  return new Response(
    JSON.stringify(data),
    { headers:{ "Content-Type":"application/json" } }
  )

})