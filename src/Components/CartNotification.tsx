type Props = {
  show: boolean;
  productName: string;
};

function CartNotification({ show, productName }: Props) {

  if (!show) return null;

  return (
    <div className="cart-toast">
      ✓ {productName} added to cart
    </div>
  );
}

export default CartNotification;