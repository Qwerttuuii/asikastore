import { Link } from "react-router-dom"

export default function OrderSuccess(){

return(

<div style={{padding:"120px",textAlign:"center"}}>

<h1>🎉 Order Successful</h1>

<p>Your payment was successful and your order has been placed.</p>

<Link to="/shop">
Continue Shopping
</Link>

</div>

)

}