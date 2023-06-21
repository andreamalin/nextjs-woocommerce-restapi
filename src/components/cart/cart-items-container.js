import React, { useContext, useState } from 'react';
import { AppContext } from '../context';
import CartItem from './cart-item';
import { useRouter } from 'next/router';

import Link from 'next/link';
import { clearCart } from '../../utils/cart';

const CartItemsContainer = () => {
	const [ cart, setCart ] = useContext( AppContext );
	const { cartItems, totalPrice, totalQty } = cart || {};
	const [ isClearCartProcessing, setClearCartProcessing ] = useState( false );
	const router = useRouter()
	
	// Clear the entire cart.
	const handleClearCart = async ( event ) => {
		event.stopPropagation();
		
		if (isClearCartProcessing) {
			return;
		}
		
		await clearCart( setCart, setClearCartProcessing ).then(() => {
			router.back();
		});
	};

	const handleGoBack = () => {
		router.back()
	}
	
	return (
		<div className="content-wrap-cart">
			{ cart ? (
				<div className="cart-layout">
					{/*Cart Items*/ }
					<div className="cart-items-layout">
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
							<Link href="/checkout">
								<button className="proceed-to-checkout">
									<span className="woo-next-cart-checkout-txt">
										Pagar
									</span>
								</button>
							</Link>
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
