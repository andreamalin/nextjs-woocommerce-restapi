import React, { useContext, useState } from 'react';
import { AppContext } from '../context';
import CartItem from './cart-item';
import { useRouter } from 'next/router';

import Link from 'next/link';
import { clearCart } from '../../utils/cart';
import PopUp from '../popup';

const CartItemsContainer = ({ handleUserInactivity, removeUserInactivity }) => {
	const [ cart, setCart ] = useContext( AppContext );
	const { cartItems, totalPrice, totalQty } = cart || {};
	const [ isClearCartProcessing, setClearCartProcessing ] = useState( false );
	const [ step, setStep ] = useState(0)

	const router = useRouter()

	const handleCheckoutSteps = () => {
		if (step == 1) {
			return (
				<PopUp 
						quaternaryText="Total a pagar: Q30,000"
						secondaryText="Selecciona el método de pago"
						secondaryButtonText="Regresar"
						secondaryButtonFunction={() => setStep(0)}
						paymentMethod={() => setStep(2)}
						showPayments
					/>
			)
		} else if (step == 2) {
			removeUserInactivity()
			setTimeout(() => {
				setStep(3)
			}, 1000)

			return <PopUp 
				quaternaryText="Por favor, espere..."
				icon="receipt"
				showLoader
			/> 
		} else if (step == 3) {
			return <PopUp 
					quaternaryText="Recibo de orden"
					primaryText="¡Gracias!"
					icon="printer"
					isPrinter
					secondaryButtonText="Terminar orden"
				/> 
		} else {
			return <></>
		}
	}
	
	// Clear the entire cart.
	const handleClearCart = async ( event ) => {
		event.stopPropagation();
		
		if (isClearCartProcessing) {
			return;
		}
		
		await clearCart( setCart, setClearCartProcessing )
	};

	const handleGoBack = () => {
		router.back()
	}
	
	return (
		<div className="content-wrap-cart">
			{ handleCheckoutSteps() }
			{ cart ? (
				<div className="cart-layout">
					{/*Cart Items*/ }
					<div className="cart-items-layout" onScroll={handleUserInactivity}>
						{ cartItems.length &&
						cartItems.map( ( item ) => (
							<CartItem
								key={ item.product_id }
								item={ item }
								products={ cartItems }
								setCart={setCart}
							/>
						) ) }
					</div>
					
					{/*Cart Total*/ }
					<div className="cart-bottom-layout">
						<div className='total-price'>
							Total({totalQty}): {cartItems?.[0]?.currency ?? ''}{ totalPrice.toFixed(2) }
						</div>

						<div className='buttons-cart-footer'>
							<div className='outline-buttons'>
								{/*Clear entire cart*/}
								<button
									onClick={() => handleGoBack()}
								>
									<span className="woo-next-cart">Regresar</span>
								</button>

								{/*Clear entire cart*/}
								<button
									onClick={(event) => handleClearCart(event)}
									disabled={isClearCartProcessing}
								>
									<span className="woo-next-cart">{!isClearCartProcessing ? "Cancelar" : "Cancelando..."}</span>
								</button>
							</div>
							{/*Checkout*/}
							<button className="proceed-to-checkout" onClick={() => setStep(1)}>
								<span className="woo-next-cart-checkout-txt">
									Pagar
								</span>
							</button>
						</div>
					</div>
				</div>
			) : (
				<div className="mt-14">
				</div>
			) }
		</div>
	);
};

export default CartItemsContainer;
