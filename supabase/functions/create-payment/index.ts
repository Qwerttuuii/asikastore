import { serve } from "https://deno.land/std/http/server.ts"

serve(async (req) => {

  const { email, amount } = await req.json()

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      amount
    })
  })

  const data = await response.json()

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } }
  )

})