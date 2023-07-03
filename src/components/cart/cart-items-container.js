import React, { useContext, useState } from 'react';
import { AppContext } from '../context';
import CartItem from './cart-item';
import { useRouter } from 'next/router';

import Link from 'next/link';
import { clearCart, updateOrderNo } from '../../utils/cart';
import PopUp from '../popup';
import { printOrder } from '../../libs/printing'
import { goBack } from '../../utils/go-back';

const CartItemsContainer = ({ handleUserInactivity, removeUserInactivity }) => {
	const [ cart, setCart ] = useContext( AppContext );
	const { cartItems, totalPrice, totalQty, orderNo } = cart || {};

	const [ isClearCartProcessing, setClearCartProcessing ] = useState( false );
	const [ step, setStep ] = useState(0)
	const [ printed, setPrinted ] = useState(false)

	const router = useRouter()

	// Clear the entire cart.
	const handleClearCart = async ( event ) => {
		event.stopPropagation();
		
		if (isClearCartProcessing) {
			return;
		}
		
		await clearCart( setCart, setClearCartProcessing )
	};

	const handleCheckoutSteps = () => {
		if (step == 1) {
			return (
				<PopUp 
						quaternaryText={`Total a pagar: ${cartItems?.[0]?.currency ?? ''}${ totalPrice?.toLocaleString() }`}
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
			}, 2000)

			return <PopUp 
				quaternaryText="Por favor, espere..."
				icon="receipt"
				showLoader
			/> 
		} else if (step == 3) {
			if (!printed) {
				setPrinted(true)
				printOrder(cartItems, totalPrice)
			}
			return <PopUp 
					quaternaryText="Recibo de orden"
					primaryText="¡Gracias!"
					icon="printer"
					printerText={[orderNo, totalPrice]}
					isPrinter
					secondaryButtonFunction={() => {
						updateOrderNo(setCart)
						goBack()
					}}
					secondaryButtonText="Terminar orden"
				/> 
		} else {
			return <></>
		}
	}

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
						{ cartItems?.length &&
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
							Total({totalQty}): {cartItems?.[0]?.currency ?? ''}{ totalPrice?.toLocaleString() }
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
									<span className="woo-next-cart">{!isClearCartProcessing ? "Cancelar orden" : "Cancelando..."}</span>
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
