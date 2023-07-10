import React from "react";
import { useSelector } from "react-redux";
import CartProduct from "../component/cartProduct";
import emptyCartImage from "../images/empty.gif"
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const productCartItem = useSelector((state) => state.product.cartItem);
  const user = useSelector(state => state.user)
  const navigate = useNavigate()

  const totalPrice = productCartItem.reduce(
    (acc, curr) => acc + parseInt(curr.total),
    0
  );
  const totalQty = productCartItem.reduce(
    (acc, curr) => acc + parseInt(curr.qty),
    0
  );
  
  const handlePayment = async()=>{

      if(user.email){
          
          const stripePromise = await loadStripe ("pk_test_51NSOFIFH2g63ceDbaZuQOVIUVqUg9DiK3yYp7vpeGy81Mkrjtj9qekMJssi99pkG9WGUo1IiZf10OFnpucqg5m0t00Z0oWubvk")
          const res = await fetch(`http://localhost:5600/create-checkout-session`,{
            method : "POST",
            headers  : {
              "content-type" : "application/json"
            },
            body : JSON.stringify(productCartItem)
          })
          if(res.statusCode === 500) return;

          const data = await res.json()
          console.log(data)

          toast("Rediriger vers la passerelle de paiement...!")
          stripePromise.redirectToCheckout({sessionId : data}) 
      }
      else{
        toast("Vous n'êtes pas connecté!")
        setTimeout(()=>{
          navigate("/login")
        },1000)
      }
    
  }
  return (
    <>
    
      <div className="p-2 md:p-4">
        <h2 className="text-lg md:text-2xl font-bold text-slate-600">
        Articles de votre panier
        </h2>

        {productCartItem[0] ?
        <div className="my-4 flex gap-3">
          {/* Display cart items  */}
          <div className="w-full max-w-3xl ">
            {productCartItem.map((el) => {
              return (
                <CartProduct
                  key={el._id}
                  id={el._id}
                  name={el.name}
                  image={el.image}
                  category={el.category}
                  qty={el.qty}
                  total={el.total}
                  price={el.price}
                />
              );
            })}
          </div>

          {/* Total cart item  */}
          <div className="w-full max-w-md  ml-auto">
            <h2 className="bg-blue-500 text-white p-2 text-lg">Résumé</h2>
            <div className="flex w-full py-2 text-lg border-b">
              <p>Quantité totale:</p>
              <p className="ml-auto w-32 font-bold">{totalQty}</p>
            </div>
            <div className="flex w-full py-2 text-lg border-b">
              <p>Prix total:</p>
              <p className="ml-auto w-32 font-bold">
                <span className="text-red-500"> {totalPrice}</span> DT </p>
            </div>
            <button className="bg-red-500 w-full text-lg font-bold py-2 text-white" onClick={handlePayment}>
              Paiement
            </button>
          </div>
        </div>

        : 
        <>
          <div className="flex w-full justify-center items-center flex-col">
            <img src={emptyCartImage} alt=" " className="w-full max-w-sm"/>
            <p className="text-slate-500 text-3xl font-bold">Panier vide</p>
          </div>
        </>
      }
      </div>
    
    </>
  );
};

export default Cart;
